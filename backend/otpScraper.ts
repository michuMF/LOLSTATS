/* eslint-disable @typescript-eslint/no-explicit-any */
// backend/otpScraper.ts
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// --- KONFIGURACJA ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

const API_KEY = process.env.RIOT_API_KEY;

// --- ARGUMENT PARSING & CONFIG ---
const args = process.argv.slice(2);
const getArg = (key: string) => {
  const found = args.find((a) => a.startsWith(`--${key}=`));
  return found ? found.split("=")[1] : null;
};
const hasArg = (key: string) => args.includes(`--${key}`);

const REGION_ID = getArg("region") || "euw1";
const REGION_ROUTING = REGION_ID.startsWith("eu") ? "europe" : "americas";
const DEEP_SCAN = hasArg("deep");
const MAX_PAGES = Number(getArg("pages")) || 4; // Zmniejszono domyślny zasięg dla głębokiego skanu
const TARGET_TIER = getArg("tier")
  ? [getArg("tier")!.toUpperCase()]
  : ["CHALLENGER", "GRANDMASTER", "MASTER"];

const WEBSITE_DB_PATH = path.join(__dirname, "otp_data_v4.json");
const AI_DATASET_PATH = path.join(__dirname, "ai_dataset_raw.jsonl");

console.log(
  `🔧 CONFIG: Region=${REGION_ID}, Pages=${MAX_PAGES}, Deep=${DEEP_SCAN}, Tiers=${TARGET_TIER.join(",")}`
);

// --- HELPERY & RATE LIMITER ---
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Prosty Bucket Rate Limiter
let requestTokens = 18; // Start z zapasem (limit to zazwyczaj 20/1s lub 100/2min)
setInterval(() => {
  if (requestTokens < 18) requestTokens++;
}, 1200); // Regeneracja
const waitForToken = async () => {
  while (requestTokens <= 0) await delay(500);
  requestTokens--;
};

const fetchJson = async (url: string, retries = 3): Promise<any> => {
  await waitForToken();
  const headers = { "X-Riot-Token": API_KEY || "" };
  try {
    const res = await fetch(url, { headers });
    if (res.status === 403) throw new Error("403_FORBIDDEN");

    if (res.status === 429) {
      console.warn("⏳ Rate Limit (429)! Backing off...");
      await delay(5000 + Math.random() * 3000);
      return fetchJson(url, retries); // Retry indefinitely or until manual stop for scraper
    }

    if (res.status >= 500 && retries > 0) {
      await delay(2000);
      return fetchJson(url, retries - 1);
    }

    if (!res.ok) return null;
    return res.json();
  } catch (e: any) {
    if (e.message === "403_FORBIDDEN") throw e;
    return null;
  }
};

// --- TIMELINE TYPES ---
interface TimelineEvent {
  type: string;
  timestamp: number;
  skillSlot?: number;
  itemId?: number;
  participantId: number;
  levelUpType?: string;
}

interface TimelineFrame {
  events: TimelineEvent[];
  participantFrames: Record<
    string,
    {
      totalGold: number;
      minionsKilled: number;
      jungleMinionsKilled: number;
      xp: number;
      level: number;
    }
  >;
}

interface TimelineData {
  info: {
    frames: TimelineFrame[];
    participants: { participantId: number; puuid: string }[];
  };
}

const fetchTimeline = async (matchId: string): Promise<TimelineData | null> => {
  if (!DEEP_SCAN) return null;
  return fetchJson(
    `https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`
  );
};

// Funkcja pomocnicza do mapowania slotów spacjami (Q, W, E, R)
const SKILL_SLOTS: Record<number, string> = { 1: "Q", 2: "W", 3: "E", 4: "R" };

let websiteDatabase: Record<number, any> = {};

export const runOtpScraper = async () => {
  console.log(`🌌 Start Scrapera V6 (Black Hole Edition)...`);

  // Ładowanie bazy WWW (żeby nie tracić Challengerów)
  if (fs.existsSync(WEBSITE_DB_PATH)) {
    try {
      websiteDatabase = JSON.parse(fs.readFileSync(WEBSITE_DB_PATH, "utf-8"));
    } catch {
      /* ignore */
    }
  }

  try {
    for (const tier of TARGET_TIER) {
      console.log(`\n🛡️ --- SKANOWANIE: ${tier} (Deep: ${DEEP_SCAN}) ---`);

      for (let page = 1; page <= MAX_PAGES; page++) {
        const players = await fetchJson(
          `https://${REGION_ID}.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/${tier}/I?page=${page}`
        );

        if (!players || players.length === 0) {
          console.log(` -> Brak graczy w ${tier} (strona ${page}).`);
          break;
        }

        players.sort((a: any, b: any) => b.leaguePoints - a.leaguePoints);
        console.log(`🔥 Znaleziono ${players.length} graczy. Pobieram dane...`);

        let counter = 0;
        for (const player of players) {
          counter++;
          // ZABEZPIECZENIE PRZED CRASHEM: Cała logika gracza w try-catch
          try {
            const puuid = player.puuid;
            process.stdout.write(
              `\r   [${tier} ${page}] ${counter}/${players.length}: ${player.summonerName || "Unknown"}`
            );

            // 1. Mastery
            const mastery = await fetchJson(
              `https://${REGION_ID}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=1`
            );
            if (!mastery || mastery.length === 0) continue;

            const mainId = mastery[0].championId;
            const pts = mastery[0].championPoints;
            const minPts = tier === "CHALLENGER" ? 30000 : 45000;

            if (pts < minPts) continue;

            // 2. Historia
            const history = await fetchJson(
              `https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=10`
            );
            if (!history) continue;

            for (const matchId of history) {
              const match = await fetchJson(
                `https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/${matchId}`
              );
              if (!match) continue;

              // FIX BŁĘDU "UNDEFINED": Znajdź gracza bezpiecznie
              const p = match.info.participants.find((x: any) => x.puuid === puuid);

              // JEŚLI NIE MA GRACZA W DANYCH MECZU -> POMIŃ
              if (!p) continue;

              const kda = (p.kills + p.assists) / (p.deaths || 1);

              // Kryteria jakości pod AI
              if (p.championId === mainId && p.win && match.info.gameDuration > 1000 && kda > 2.0) {
                const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter(
                  (i: number) => i !== 0
                );
                if (items.length < 3) continue;

                const enemy = match.info.participants.find(
                  (e: any) => e.teamId !== p.teamId && e.teamPosition === p.teamPosition
                );

                // --- TIMELINE ANALYSIS (DEEP) ---
                const skillOrder: string[] = [];
                const buildOrder: { itemId: number; timestamp: number }[] = [];
                let laningSnapshot = { gold: 0, cs: 0, xp: 0 };

                if (DEEP_SCAN) {
                  const timeline = await fetchTimeline(matchId);
                  if (timeline) {
                    // Znajdź nasz participantId w timeline
                    const pId = timeline.info.participants.find(
                      (tp) => tp.puuid === puuid
                    )?.participantId;
                    if (pId) {
                      // A. Skill Order & Build
                      timeline.info.frames.forEach((frame) => {
                        frame.events.forEach((ev) => {
                          if (ev.participantId === pId) {
                            if (
                              ev.type === "SKILL_LEVEL_UP" &&
                              ev.skillSlot &&
                              ev.levelUpType === "NORMAL"
                            ) {
                              const key = SKILL_SLOTS[ev.skillSlot];
                              if (key) skillOrder.push(key);
                            }
                            if (ev.type === "ITEM_PURCHASED" && ev.itemId) {
                              buildOrder.push({ itemId: ev.itemId, timestamp: ev.timestamp });
                            }
                          }
                        });
                      });

                      // B. Laning Snapshot (np. 14 minuta)
                      const frame14 = timeline.info.frames[14];
                      if (frame14) {
                        const pFrame = frame14.participantFrames[pId.toString()];
                        if (pFrame) {
                          laningSnapshot = {
                            gold: pFrame.totalGold,
                            cs: pFrame.minionsKilled + pFrame.jungleMinionsKilled,
                            xp: pFrame.xp,
                          };
                        }
                      }
                    }
                  }
                }

                // --- EKSTRAKCJA WSZYSTKIEGO (FULL DATA) ---
                const fullDataEntry = {
                  meta: {
                    matchId: matchId,
                    championId: mainId,
                    patch: match.info.gameVersion,
                    tier: tier,
                    duration: match.info.gameDuration,
                  },
                  player: {
                    name: p.riotIdGameName || player.summonerName,
                    rank: `${tier} ${player.leaguePoints}LP`,
                    position: p.teamPosition,
                    win: p.win,
                  },
                  // Deep Data
                  deep: {
                    skillOrder,
                    buildOrder,
                    laningSnapshot,
                  },
                  // Podstawy
                  performance: {
                    kda: `${p.kills}/${p.deaths}/${p.assists}`,
                    kdaRatio: Number(kda.toFixed(2)),
                    csPerMin: Number(
                      (
                        (p.totalMinionsKilled + p.neutralMinionsKilled) /
                        (match.info.gameDuration / 60)
                      ).toFixed(2)
                    ),
                    goldPerMin: Number((p.goldEarned / (match.info.gameDuration / 60)).toFixed(2)),
                    damageDealt: p.totalDamageDealtToChampions,
                    damageTaken: p.totalDamageTaken,
                    healing: p.totalHeal,
                    shields: p.totalDamageShieldedOnTeammates,
                  },
                  // Szczegółowe Combat
                  combatDetails: {
                    soloKills: p.challenges?.soloKills || 0,
                    multikills: p.largestMultiKill,
                    killingSprees: p.killingSprees,
                    skillshotsDodged: p.challenges?.skillshotsDodged || 0,
                    skillshotsHit: p.challenges?.skillshotsHit || 0,
                    damageSelfMitigated: p.damageSelfMitigated,
                    timeCCingOthers: p.timeCCingOthers,
                  },
                  // Agresja / Skille (Ważne dla AI - styl gry)
                  spellCasting: {
                    q: p.spell1Casts,
                    w: p.spell2Casts,
                    e: p.spell3Casts,
                    r: p.spell4Casts,
                    summ1: p.summoner1Casts,
                    summ2: p.summoner2Casts,
                  },
                  // Komunikacja (Pingi) - czy toksyczny? czy lider?
                  behavior: {
                    allInPings: p.allInPings,
                    assistPings: p.assistPings,
                    commandPings: p.commandPings,
                    enemyMissingPings: p.enemyMissingPings,
                    dangerPings: p.dangerPings,
                    visionPings: p.visionPings,
                    pushPings: p.pushPings,
                  },
                  // Objectives & Turrets
                  objectives: {
                    turretPlates: p.challenges?.turretPlatesTaken || 0,
                    turretsDestroyed: p.turretKills,
                    inhibitorsDestroyed: p.inhibitorKills,
                    damageToTurrets: p.damageDealtToTurrets,
                    damageToObjectives: p.damageDealtToObjectives,
                    dragonKills: p.dragonKills || 0,
                    baronKills: p.baronKills || 0,
                    scuttleCrabKills: p.challenges?.scuttleCrabKills || 0,
                  },
                  // Vision
                  vision: {
                    score: p.visionScore,
                    wardsPlaced: p.wardsPlaced,
                    wardsKilled: p.wardsKilled,
                    controlWardsBought: p.visionWardsBoughtInGame,
                  },
                  // Build
                  build: {
                    items: items,
                    spells: [p.summoner1Id, p.summoner2Id],
                    runes: {
                      primaryStyle: p.perks.styles[0].style,
                      primarySelections: p.perks.styles[0].selections.map((s: any) => s.perk),
                      subStyle: p.perks.styles[1].style,
                      subSelections: p.perks.styles[1].selections.map((s: any) => s.perk),
                    },
                  },
                  // Early Game (Laning Phase)
                  earlyGame: {
                    goldDiff10: p.challenges?.goldDiffAt15 || 0, // API często ma tylko at 15
                    xpDiff10: p.challenges?.xpDiffAt15 || 0,
                    csDiff10: p.challenges?.csDiffAt15 || 0,
                    firstBloodKill: p.firstBloodKill,
                    firstBloodAssist: p.firstBloodAssist,
                    laneMinionsFirst10min: p.challenges?.laneMinionsFirst10Minutes || 0,
                  },
                  // Kontekst
                  matchup: {
                    enemyChampionId: enemy ? enemy.championId : -1,
                    enemyKdaRatio: enemy
                      ? Number(((enemy.kills + enemy.assists) / (enemy.deaths || 1)).toFixed(2))
                      : 0,
                  },
                  // FULL DUMP (Dla pewności wrzucamy cały obiekt challenges, gdybyśmy o czymś zapomnieli)
                  rawChallenges: p.challenges,
                };

                // ZAPIS AI (Append)
                fs.appendFileSync(AI_DATASET_PATH, JSON.stringify(fullDataEntry) + "\n");

                // ZAPIS WWW (Overwrite jeśli lepsza ranga)
                // Jeśli mamy Challengera w bazie, a skanujemy Mastera -> nie nadpisuj WWW
                const currentDbEntry = websiteDatabase[mainId];
                const isBetter =
                  !currentDbEntry ||
                  (tier === "CHALLENGER" && !currentDbEntry.player.rank.includes("Challenger"));

                if (isBetter) {
                  websiteDatabase[mainId] = fullDataEntry;
                  process.stdout.write(
                    `\r✅ WWW UPDATE: ${p.riotIdGameName} (${tier}) -> Champ ${mainId}      \n`
                  );
                  fs.writeFileSync(WEBSITE_DB_PATH, JSON.stringify(websiteDatabase, null, 2));
                }

                break; // Znaleziono mecz, next player
              }
            }
          } catch {
            // CICHY BŁĄD GRACZA: Jeśli ten konkretny gracz wywali błąd, logujemy i lecimy dalej
            // Nie przerywamy pętli głównej!
            // console.error(` -> Błąd przy graczu: ${playerError}`);
          }

          await delay(50);
        }
      }
    }
    console.log(`\n🎉 Skanowanie zakończone! Twoja baza AI jest teraz ogromna.`);
  } catch (err: any) {
    if (err.message === "403_FORBIDDEN") {
      console.error(
        "\n⛔ CRITICAL 403: Twój klucz API nie pasuje do regionu (Sprawdź euw1 vs eun1)!"
      );
    } else {
      console.error("\n❌ Błąd główny:", err);
    }
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runOtpScraper();
}
