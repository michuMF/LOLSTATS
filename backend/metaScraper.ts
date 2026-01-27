// backend/metaScraper.ts
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

// FIX: Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- KONFIGURACJA ŚCIEŻEK ---
const FRONTEND_DATA_DIR = path.resolve(__dirname, "../src/data");
const FRONTEND_FILE_PATH = path.join(FRONTEND_DATA_DIR, "meta_data_v2.json");
const CACHE_FILE_PATH = path.join(__dirname, "processed_cache.json");

// --- SETUP API ---
const ENV_API_KEY = process.env.RIOT_API_KEY;
if (!ENV_API_KEY) {
  console.error("❌ BŁĄD: Brak RIOT_API_KEY w pliku .env!");
  process.exit(1);
}
const API_KEY: string = ENV_API_KEY;

// --- CLI ARGS ---
const args = process.argv.slice(2);
const getArg = (key: string) => {
  const found = args.find((a) => a.startsWith(`--${key}=`));
  return found ? found.split("=")[1] : null;
};

// -- ROUTING CONFIG --
// Argument --region SHOULD be the platform ID (e.g., 'euw1', 'na1', 'eun1')
const ARG_REGION = getArg("region") || "euw1";
const PLATFORM_ID = ARG_REGION.toLowerCase();

function getCluster(platform: string): string {
  if (["euw1", "eun1", "tr1", "ru"].includes(platform)) return "europe";
  if (["na1", "br1", "la1", "la2"].includes(platform)) return "americas";
  if (["kr", "jp1"].includes(platform)) return "asia";
  if (["oc1", "ph2", "sg2", "th2", "tw2", "vn2"].includes(platform)) return "sea";
  return "europe"; // Fallback
}

const CLUSTER = getCluster(PLATFORM_ID);

const TARGET_TIER_ARG = getArg("tier")?.toUpperCase();
const PAGES_ARG = Number(getArg("pages")) || 1;

// --- KONFIGURACJA SKRAPOWANIA ---
const TIERS_TO_SCRAPE = TARGET_TIER_ARG
  ? [TARGET_TIER_ARG]
  : ["CHALLENGER", "GRANDMASTER", "MASTER", "EMERALD"];

const PLAYERS_PER_TIER = 50 * PAGES_ARG; // Skalowalne ilością stron
const MATCHES_PER_PLAYER = 20;

// --- TYPY DANYCH ---
interface StatBucket {
  picks: number;
  wins: number;
}
interface RoleStats {
  matches: number;
  wins: number;
  items: Record<string, StatBucket>;
  marketing: {
    // Runes & Spells
    keystones: Record<string, StatBucket>;
    secondaryTrees: Record<string, StatBucket>;
    spells: Record<string, StatBucket>;
  };
}
type ChampionData = Record<string, RoleStats>; // Role -> Stats
type MetaDatabase = Record<string, Record<string, ChampionData>>; // Tier -> ChampId -> Role -> Stats

interface LeagueEntry {
  puuid?: string;
  summonerId: string;
  leaguePoints: number;
  wins: number;
  tier?: string;
}

// Globalny stan
let database: MetaDatabase = {};
let processedMatchIds = new Set<string>();

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// --- HELPERY PLIKOWE ---
function loadState() {
  if (fs.existsSync(FRONTEND_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(FRONTEND_FILE_PATH, "utf-8");
      database = JSON.parse(raw);
      console.log(`📦 Wczytano bazę danych.`);
    } catch {
      console.error("⚠️ Błąd odczytu bazy.");
    }
  }
  if (fs.existsSync(CACHE_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
      const ids = JSON.parse(raw) as string[];
      processedMatchIds = new Set(ids);
      console.log(`💾 Cache: ${processedMatchIds.size} pominiętych meczów.`);
    } catch {
      console.error("⚠️ Błąd odczytu cache.");
    }
  }
}

function saveState() {
  if (!fs.existsSync(FRONTEND_DATA_DIR)) fs.mkdirSync(FRONTEND_DATA_DIR, { recursive: true });
  fs.writeFileSync(FRONTEND_FILE_PATH, JSON.stringify(database, null, 2));
  fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(Array.from(processedMatchIds)));
}

// --- POBIERANIE GRACZY ---
async function fetchPlayersFromTier(tier: string) {
  const isApex = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);
  const puuids: string[] = [];
  console.log(`\n🔍 Pobieranie graczy z ligi: ${tier}...`);

  try {
    let entries: LeagueEntry[] = [];
    const platformHost = PLATFORM_ID;

    if (isApex) {
      const url = `https://${platformHost}.api.riotgames.com/lol/league/v4/${tier.toLowerCase()}leagues/by-queue/RANKED_SOLO_5x5`;
      const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = (await res.json()) as { entries: LeagueEntry[] };
      entries = data.entries;
    } else {
      const url = `https://${platformHost}.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/${tier}/I?page=1`;
      const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      entries = (await res.json()) as LeagueEntry[];
    }

    const topEntries = entries
      .sort((a, b) => b.leaguePoints - a.leaguePoints)
      .slice(0, PLAYERS_PER_TIER);

    console.log(`   -> Znaleziono ${topEntries.length} kandydatów. Konwertowanie na PUUID...`);

    for (const entry of topEntries) {
      if (entry.puuid) {
        puuids.push(entry.puuid);
      } else {
        await delay(50);
        try {
          const sumUrl = `https://${platformHost}.api.riotgames.com/lol/summoner/v4/summoners/${entry.summonerId}`;
          const sRes = await fetch(sumUrl, { headers: { "X-Riot-Token": API_KEY } });
          if (sRes.ok) {
            const sData = (await sRes.json()) as { puuid: string };
            puuids.push(sData.puuid);
          }
        } catch {
          /* ignore */
        }
      }
    }
  } catch (e) {
    console.error(`❌ Błąd pobierania ligi ${tier}:`, e);
  }
  return puuids;
}

// --- POBIERANIE MECZÓW ---
async function fetchMatchesForPlayer(puuid: string) {
  const url = `https://${CLUSTER}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=${MATCHES_PER_PLAYER}`;
  try {
    const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
    if (res.status === 429) {
      await delay(5000);
      return [];
    }
    if (!res.ok) return [];
    return (await res.json()) as string[];
  } catch {
    return [];
  }
}

// --- ANALIZA MECZU ---
async function processMatch(matchId: string, currentTier: string) {
  if (processedMatchIds.has(matchId)) return false;

  const url = `https://${CLUSTER}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  try {
    const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });

    if (res.status === 429) {
      console.warn("⏳ Rate Limit. Pauza 5s.");
      await delay(5000);
      return false;
    }
    if (!res.ok) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any;
    processedMatchIds.add(matchId);

    if (data.info && data.info.participants) {
      // Analizujemy WSZYSTKICH 10 graczy w meczu
      for (const p of data.info.participants) {
        const champId = p.championId.toString();
        const win = p.win;

        // Wykrywanie roli (TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY)
        let position = p.teamPosition;
        if (!position || position === "") position = "UNKNOWN";

        // Init Tier -> Champ
        if (!database[currentTier]) database[currentTier] = {};
        if (!database[currentTier][champId]) database[currentTier][champId] = {}; // Champ -> Role Map

        // Init Role Stats
        if (!database[currentTier][champId][position]) {
          database[currentTier][champId][position] = {
            matches: 0,
            wins: 0,
            items: {},
            marketing: { keystones: {}, secondaryTrees: {}, spells: {} },
          };
        }

        const roleStats = database[currentTier][champId][position];

        roleStats.matches++;
        if (win) roleStats.wins++;

        const updateBucket = (bucket: Record<string, StatBucket>, key: string) => {
          if (!bucket[key]) bucket[key] = { picks: 0, wins: 0 };
          bucket[key].picks++;
          if (win) bucket[key].wins++;
        };

        // 1. Items
        const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter(
          (id: number) => id > 0
        );
        items.forEach((id: number) => updateBucket(roleStats.items, id.toString()));

        // 2. Runes
        const primaryStyle = p.perks.styles[0];
        const subStyle = p.perks.styles[1];
        if (primaryStyle && primaryStyle.selections[0]) {
          updateBucket(roleStats.marketing.keystones, primaryStyle.selections[0].perk.toString());
        }
        if (subStyle) {
          updateBucket(roleStats.marketing.secondaryTrees, subStyle.style.toString());
        }

        // 3. Spells
        const s1 = p.summoner1Id;
        const s2 = p.summoner2Id;
        const spellKey = s1 < s2 ? `${s1}_${s2}` : `${s2}_${s1}`; // Normalizacja kolejności
        updateBucket(roleStats.marketing.spells, spellKey);
      }
      return true;
    }
  } catch (e) {
    console.error(`❌ Błąd meczu ${matchId}`, e);
  }
  return false;
}

// --- MAIN LOOP ---
async function main() {
  loadState();
  console.log("--- ROZPOCZYNAM SKRAPOWANIE WIELOLIGOWE (V2 - Runy & Winrates) ---");
  console.log(`Ligi do pobrania: ${TIERS_TO_SCRAPE.join(", ")}`);
  console.log(`Region: ${PLATFORM_ID} (Cluster: ${CLUSTER}), Pages: ${PAGES_ARG}`);

  for (const tier of TIERS_TO_SCRAPE) {
    const players = await fetchPlayersFromTier(tier);
    console.log(`📊 Liga ${tier}: Znaleziono ${players.length} graczy. Analiza meczów...`);

    if (players.length === 0) continue;

    let processedCount = 0;
    for (let i = 0; i < players.length; i++) {
      const puuid = players[i];
      const matches = await fetchMatchesForPlayer(puuid);

      process.stdout.write(
        `\r[${tier}] Gracz ${i + 1}/${players.length} (${matches.length} gier): `
      );

      for (const matchId of matches) {
        const isNew = await processMatch(matchId, tier);
        process.stdout.write(isNew ? "." : "_");
        if (isNew) {
          processedCount++;
          await delay(1200); // Rate Limit Guard
        }
      }

      // Autosave regularny
      if (i % 5 === 0) saveState();
    }
    console.log(`\n✅ Zakończono ligę ${tier}. Nowych meczów: ${processedCount}`);
    saveState();
  }

  console.log("\n--- KONIEC ---");
  saveState();
}

main().catch(console.error);
