/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, "../otp_data_v4.json");

let expertDb: Record<number, any> | null = null; // Cache in-memory

const loadDb = () => {
  if (expertDb) return expertDb;
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      expertDb = JSON.parse(raw);
      console.log(
        `📘 [ExpertData] Załadowano dane eksperckie: ${Object.keys(expertDb || {}).length} wpisów.`
      );
    } else {
      console.warn(`⚠️ [ExpertData] Nie znaleziono pliku bazy: ${DB_PATH}`);
      expertDb = {};
    }
  } catch (e) {
    console.error("❌ [ExpertData] Błąd odczytu bazy:", e);
    expertDb = {};
  }
  return expertDb;
};

export interface ExpertGuide {
  player: string;
  rank: string;
  kda: string;
  skills: string[];
  buildPath: { itemId: number; timestamp: number }[];
  earlyStats: { gold: number; cs: number; xp: number };
}

export const getExpertGuide = (championId: number): ExpertGuide | null => {
  const db = loadDb();
  if (!db) return null;

  // 1. Szukamy exact match (Nasz Champ vs Ich Champ) - TODO: Baza musiałaby być listą meczów, a nie mapą champId -> bestGame
  // Obecna struktura to Map<ChampionId, BestGame>.
  // W przyszłości można to zmienić na Map<ChampionId, List<Game>>.

  // Na ten moment zwracamy "Najlepszego Challengera na tym championie"
  const entry = db[championId];

  if (!entry) return null;

  return {
    player: entry.player.name,
    rank: entry.player.rank,
    kda: entry.performance.kda,
    skills: entry.deep?.skillOrder || [],
    buildPath: entry.deep?.buildOrder || [],
    earlyStats: entry.deep?.laningSnapshot || { gold: 0, cs: 0, xp: 0 },
  };
};
