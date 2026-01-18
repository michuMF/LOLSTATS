// backend/otpScraper.ts
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// --- 1. KONFIGURACJA ŚRODOWISKA ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Próbujemy załadować .env z katalogu backend
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// --- 2. USTAWIENIA GŁÓWNE ---
const API_KEY = process.env.RIOT_API_KEY;

// WAŻNE: Upewnij się, że Twój klucz obsługuje ten region.
// Jeśli masz klucz EUNE, a ustawisz tu euw1, dostaniesz błąd 403.
const REGION_ID = "euw1";      
const REGION_ROUTING = "europe"; 

// Ścieżki do plików
const WEBSITE_DB_PATH = path.join(__dirname, 'otp_data_v4.json');
const AI_DATASET_PATH = path.join(__dirname, 'ai_dataset_raw.jsonl');

// Konfiguracja skanowania
const TIERS_TO_SCAN = ["CHALLENGER", "GRANDMASTER", "MASTER"];
const MAX_PAGES_PER_TIER = 2; // Ile stron pobierać z każdej dywizji (1 strona = ok 200 graczy)

// --- 3. FUNKCJE POMOCNICZE (HELPERY) ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const fetchJson = async (url: string) => {
  const headers = { 
      "X-Riot-Token": API_KEY || "",
      "User-Agent": "Mozilla/5.0 (Node.js) LOLStats/1.0"
  };

  try {
      const res = await fetch(url, { headers });

      // OBSŁUGA BŁĘDÓW (DEBUGOWANIE)
      if (res.status === 403) {
          console.error(`\n⛔ BŁĄD 403 (Forbidden) na URL: ${url}`);
          console.error(`   -> Twój klucz API nie działa na regionie ${REGION_ID} lub wygasł.`);
          console.error(`   -> Spróbuj zmienić REGION_ID na 'eun1' w kodzie.`);
          throw new Error("API Key Error");
      }
      if (res.status === 404) {
          // 404 jest OK tylko jeśli po prostu nie ma danych, ale warto to zalogować w trybie debug
          // console.warn(`   -> Info: Brak danych pod adresem (404).`);
          return null;
      }
      if (res.status === 429) {
          console.warn("⏳ Limit API (429)! Czekam 10 sekund...");
          await delay(10000);
          return fetchJson(url); // Retry
      }
      if (!res.ok) {
          console.error(`❌ BŁĄD HTTP ${res.status}: ${url}`);
          return null;
      }

      return res.json();
  } catch (e: any) { 
      // Jeśli to nasz rzucony błąd, ignorujemy logowanie (już zalogowane wyżej)
      if (e.message !== "API Key Error") {
          console.error(`❌ Błąd połączenia (Fetch Error): ${e.message}`);
      }
      return null; 
  }
};

// Typy danych (Uproszczone dla czytelności kodu, ale zachowujące strukturę)
type OtpBuildFull = any; 

let websiteDatabase: Record<number, OtpBuildFull> = {};

// --- 4. GŁÓWNA LOGIKA ---
export const runOtpScraper = async () => {
  console.log(`👑 Start Scrapera V5.1 (Debug Mode)...`);
  console.log(`🌍 Region: ${REGION_ID} | Routing: ${REGION_ROUTING}`);
  
  if (!API_KEY) {
      console.error("❌ KRYTYCZNY BŁĄD: Nie znaleziono VITE_API_KEY w pliku .env!");
      console.error("   Upewnij się, że plik .env jest w folderze backend.");
      return;
  }
  
  // Ładowanie bazy
  if (fs.existsSync(WEBSITE_DB_PATH)) {
      try { 
          websiteDatabase = JSON.parse(fs.readFileSync(WEBSITE_DB_PATH, 'utf-8')); 
          console.log(`✅ Załadowano obecną bazę: ${Object.keys(websiteDatabase).length} postaci.`);
      } catch(e) {}
  }

  try {
    // PĘTLA PO DYWIZJACH
    for (const tier of TIERS_TO_SCAN) {
        console.log(`\n🛡️ --- SKANOWANIE: ${tier} ---`);
        
        for (let page = 1; page <= MAX_PAGES_PER_TIER; page++) {
            const url = `https://${REGION_ID}.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/${tier}/I?page=${page}`;
            console.log(`📄 Pobieranie strony ${page}...`);
            
            const players = await fetchJson(url);

            // Jeśli fetch zwrócił null (błąd) lub pustą tablicę
            if (!players || players.length === 0) {
                console.log(`   -> Brak graczy lub błąd API dla ${tier}. Przerywam tę dywizję.`);
                break;
            }

            // Sortujemy po LP
            players.sort((a: any, b: any) => b.leaguePoints - a.leaguePoints);
            console.log(`🔥 Znaleziono ${players.length} graczy. Analizuję...`);

            let counter = 0;
            for (const player of players) {
                counter++;
                const puuid = player.puuid;

                // Status w jednej linii
                process.stdout.write(`\r   [${tier} ${page}] ${counter}/${players.length}: ${player.summonerName || "Unknown"}`);

                // A. Mastery
                const mastery = await fetchJson(`https://${REGION_ID}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=1`);
                if (!mastery || mastery.length === 0) continue;

                const mainId = mastery[0].championId;
                const pts = mastery[0].championPoints;
                const minPts = tier === "CHALLENGER" ? 30000 : 50000;

                if (pts < minPts) continue;

                // Sprawdzamy czy mamy już lepszy build
                const currentDbEntry = websiteDatabase[mainId];
                // Jeśli mamy challengera, a skanujemy mastera -> nie nadpisujemy (chyba że nie mamy nic)
                const isBetterRank = !currentDbEntry || (tier === "CHALLENGER" && !currentDbEntry.player.rank.includes("Challenger"));
                
                // Optymalizacja: Pomiń pobieranie historii, jeśli już mamy Challengera i nie zależy nam na AI Dataset
                if (!isBetterRank && currentDbEntry) {
                   // continue; // Odkomentuj, żeby przyspieszyć (pominie Masterów jeśli mamy Challengera)
                }

                // B. Historia
                const history = await fetchJson(`https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=10`);
                if (!history) continue;

                for (const matchId of history) {
                    const match = await fetchJson(`https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/${matchId}`);
                    if (!match) continue;

                    const p = match.info.participants.find((x: any) => x.puuid === puuid);
                    
                    // KRYTERIA DOBREGO BUILDU
                    const kda = (p.kills + p.assists) / (p.deaths || 1);
                    if (p && p.championId === mainId && p.win && match.info.gameDuration > 1100 && kda > 2.5) {
                        
                        const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter(i => i !== 0);
                        if (items.length < 3) continue;

                        const enemy = match.info.participants.find((e: any) => e.teamId !== p.teamId && e.teamPosition === p.teamPosition);
                        const chall = p.challenges || {};
                        
                        const dataEntry = {
                            meta: { championId: mainId, patch: match.info.gameVersion, tier: tier },
                            player: { name: p.riotIdGameName || player.summonerName, rank: `${tier} ${player.leaguePoints}LP`, teamPosition: p.teamPosition, win: p.win },
                            performance: { 
                                kda: `${p.kills}/${p.deaths}/${p.assists}`, 
                                csPerMinute: Number(((p.totalMinionsKilled + p.neutralMinionsKilled) / (match.info.gameDuration / 60)).toFixed(1)),
                                damageDealt: p.totalDamageDealtToChampions
                            },
                            // Reszta pól zgodna z V4
                            combatType: {
                                physicalDmgPct: Number((p.physicalDamageDealtToChampions / p.totalDamageDealtToChampions).toFixed(2)),
                                magicDmgPct: Number((p.magicDamageDealtToChampions / p.totalDamageDealtToChampions).toFixed(2)),
                                trueDmgPct: Number((p.trueDamageDealtToChampions / p.totalDamageDealtToChampions).toFixed(2))
                            },
                            build: { items: items, spells: [p.summoner1Id, p.summoner2Id], runes: { primaryStyle: p.perks.styles[0].style, subStyle: p.perks.styles[1].style } },
                            matchup: { enemyChampionId: enemy ? enemy.championId : -1 },
                            earlyGame: { soloKills: chall.soloKills || 0 },
                            vision: { score: p.visionScore }
                        };

                        // 1. ZAPIS DO PLIKU AI (Append)
                        fs.appendFileSync(AI_DATASET_PATH, JSON.stringify(dataEntry) + '\n');

                        // 2. AKTUALIZACJA WWW (Overwrite)
                        if (isBetterRank) {
                            websiteDatabase[mainId] = dataEntry;
                            // Czyścimy linię konsoli i wypisujemy sukces
                            process.stdout.write(`\r✅ UPDATE: ${p.riotIdGameName} (${tier}) -> Champ ${mainId}      \n`);
                            fs.writeFileSync(WEBSITE_DB_PATH, JSON.stringify(websiteDatabase, null, 2));
                        }
                        
                        break; // Mamy mecz, lecimy do następnego gracza
                    }
                }
                await delay(50); // Delay między graczami
            }
        }
    }
    console.log(`\n🎉 Skanowanie zakończone!`);

  } catch (err) { console.error("\n❌ Błąd główny:", err); }
};

// Autostart przy wywołaniu bezpośrednim
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runOtpScraper();
}