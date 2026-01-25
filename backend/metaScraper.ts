// backend/metaScraper.ts
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// FIX: Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- KONFIGURACJA ŚCIEŻEK ---
const FRONTEND_DATA_DIR = path.resolve(__dirname, '../src/data');
const FRONTEND_FILE_PATH = path.join(FRONTEND_DATA_DIR, 'meta_data_v2.json'); // Nowa wersja pliku
const CACHE_FILE_PATH = path.join(__dirname, 'processed_cache.json');

// --- SETUP API ---
const ENV_API_KEY = process.env.RIOT_API_KEY;
if (!ENV_API_KEY) {
  console.error("❌ BŁĄD: Brak RIOT_API_KEY w pliku .env!");
  process.exit(1);
}
const API_KEY: string = ENV_API_KEY;

const REGION = "europe";
const PLATFORM = "eun1"; 

// --- KONFIGURACJA SKRAPOWANIA ---
// Możesz tu dodać: 'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'
const TIERS_TO_SCRAPE = [ 'CHALLENGER','GRANDMASTER','MASTER','DIAMOND','PLATINUM' ,'GOLD','SILVER','BRONZE','IRON' ]; 
// Ile graczy z każdej ligi bierzemy? (Zalecane małe liczby na start)
const PLAYERS_PER_TIER = 200; 
const MATCHES_PER_PLAYER = 50;

// --- TYPY ---
interface ItemStat { picks: number; wins: number; }
interface ChampionMeta { matchesAnalyzed: number; items: Record<string, ItemStat>; }
// Nowa struktura: Tier -> Champion -> Statystyki
type MetaDatabase = Record<string, Record<string, ChampionMeta>>;

interface LeagueEntry {
  puuid?: string; // Tylko w Apex tiers
  summonerId: string;
  leaguePoints: number;
  wins: number;
  tier?: string;
}

// Globalny stan
let database: MetaDatabase = {};
let processedMatchIds = new Set<string>();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- HELPERY PLIKOWE ---
function loadState() {
    // 1. Wczytaj bazę
    if (fs.existsSync(FRONTEND_FILE_PATH)) {
        try {
            const raw = fs.readFileSync(FRONTEND_FILE_PATH, 'utf-8');
            database = JSON.parse(raw);
            console.log(`📦 Wczytano bazę danych.`);
        } catch (e) { console.error("⚠️ Błąd odczytu bazy."); }
    }

    // 2. Wczytaj Cache (zapobiega duplikatom meczów)
    if (fs.existsSync(CACHE_FILE_PATH)) {
        try {
            const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
            const ids = JSON.parse(raw) as string[];
            processedMatchIds = new Set(ids);
            console.log(`💾 Cache: ${processedMatchIds.size} pominiętych meczów.`);
        } catch (e) { console.error("⚠️ Błąd odczytu cache."); }
    }
}

function saveState() {
    if (!fs.existsSync(FRONTEND_DATA_DIR)) fs.mkdirSync(FRONTEND_DATA_DIR, { recursive: true });
    
    fs.writeFileSync(FRONTEND_FILE_PATH, JSON.stringify(database, null, 2));
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(Array.from(processedMatchIds)));
    // console.log("💾 Zapisano stan.");
}

// --- POBIERANIE GRACZY (HYBRYDOWE) ---
async function fetchPlayersFromTier(tier: string) {
    const isApex = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier);
    let puuids: string[] = [];

    console.log(`\n🔍 Pobieranie graczy z ligi: ${tier}...`);

    try {
        let entries: LeagueEntry[] = [];

        if (isApex) {
            // API dla Apex Tiers (zwraca listę od razu)
            const url = `https://${PLATFORM}.api.riotgames.com/lol/league/v4/${tier.toLowerCase()}leagues/by-queue/RANKED_SOLO_5x5`;
            const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json() as { entries: LeagueEntry[] };
            entries = data.entries;
        } else {
            // API dla Standard Tiers (wymaga podania dywizji i strony)
            // Pobieramy Division I, Page 1
            const url = `https://${PLATFORM}.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/${tier}/I?page=1`;
            const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            entries = await res.json() as LeagueEntry[];
        }

        // Sortowanie i limit
        const topEntries = entries
            .sort((a, b) => b.leaguePoints - a.leaguePoints)
            .slice(0, PLAYERS_PER_TIER);

        console.log(`   -> Znaleziono ${topEntries.length} kandydatów. Konwertowanie na PUUID...`);

        // Konwersja na PUUID (Dla niższych lig Riot nie zwraca PUUID w tym endpoincie!)
        for (const entry of topEntries) {
            if (entry.puuid) {
                puuids.push(entry.puuid);
            } else {
                // Musimy odpytać summoner-v4
                await delay(100);
                try {
                    const sumUrl = `https://${PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/${entry.summonerId}`;
                    const sRes = await fetch(sumUrl, { headers: { "X-Riot-Token": API_KEY } });
                    if (sRes.ok) {
                        const sData = await sRes.json() as { puuid: string };
                        puuids.push(sData.puuid);
                    }
                } catch (err) { /* ignore */ }
            }
        }

    } catch (e) {
        console.error(`❌ Błąd pobierania ligi ${tier}:`, e);
    }

    return puuids;
}

// --- POBIERANIE MECZÓW ---
async function fetchMatchesForPlayer(puuid: string) {
  const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=${MATCHES_PER_PLAYER}`;
  try {
    const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
    if (res.status === 429) { await delay(5000); return []; }
    if (!res.ok) return [];
    return await res.json() as string[];
  } catch (e) { return []; }
}

// --- ANALIZA MECZU ---
async function processMatch(matchId: string, currentTier: string) {
  if (processedMatchIds.has(matchId)) return false; // Już był analizowany

  const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  try {
    const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
    
    if (res.status === 429) { 
        console.warn("⏳ Rate Limit. Pauza 5s."); 
        await delay(5000); 
        return false; 
    }
    if (!res.ok) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any;
    processedMatchIds.add(matchId); // Zapamiętaj, że zrobione

    if (data.info && data.info.participants) {
        for (const p of data.info.participants) {
            const champId = p.championId.toString();
            const win = p.win;
            const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter(id => id > 0);
    
            // Inicjalizacja struktury dla TIERU
            if (!database[currentTier]) database[currentTier] = {};
            if (!database[currentTier][champId]) {
                database[currentTier][champId] = { matchesAnalyzed: 0, items: {} };
            }
    
            database[currentTier][champId].matchesAnalyzed++;
    
            items.forEach((itemId: number) => {
                const idStr = itemId.toString();
                const stats = database[currentTier][champId].items;
                
                if (!stats[idStr]) stats[idStr] = { picks: 0, wins: 0 };
                
                stats[idStr].picks++;
                if (win) stats[idStr].wins++;
            });
        }
        return true;
    }
  } catch (e) { console.error(`❌ Błąd meczu ${matchId}`, e); }
  return false;
}

// --- MAIN LOOP ---
async function main() {
    loadState();
    console.log("--- ROZPOCZYNAM SKRAPOWANIE WIELOLIGOWE ---");
    console.log(`Ligi do pobrania: ${TIERS_TO_SCRAPE.join(", ")}`);

    for (const tier of TIERS_TO_SCRAPE) {
        const players = await fetchPlayersFromTier(tier);
        console.log(`📊 Liga ${tier}: Znaleziono ${players.length} graczy. Analiza meczów...`);

        if (players.length === 0) continue;

        let processedCount = 0;
        for (let i = 0; i < players.length; i++) {
            const puuid = players[i];
            const matches = await fetchMatchesForPlayer(puuid);
            
            process.stdout.write(`\r[${tier}] Gracz ${i+1}/${players.length} (${matches.length} gier): `);

            for (const matchId of matches) {
                const isNew = await processMatch(matchId, tier);
                process.stdout.write(isNew ? "." : "_");
                if (isNew) {
                    processedCount++;
                    await delay(1200); // Rate Limit Guard
                }
            }
            
            // Autosave co 5 graczy
            if (i % 5 === 0) saveState();
        }
        console.log(`\n✅ Zakończono ligę ${tier}. Nowych meczów: ${processedCount}`);
        saveState();
    }

    console.log("\n--- KONIEC ---");
    saveState();
}

main().catch(console.error);