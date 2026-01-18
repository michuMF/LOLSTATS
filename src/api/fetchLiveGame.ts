// src/api/fetchLiveGame.ts
import { z } from "zod";

// ==========================================
// 1. SUB-SCHEMAS
// ==========================================

const LivePerksSchema = z.object({
  perkIds: z.array(z.number()).nullable().optional().transform(val => val ?? []),
  perkStyle: z.number().nullable().optional().default(0),
  perkSubStyle: z.number().nullable().optional().default(0),
}).passthrough();

const LiveParticipantSchema = z.object({
  teamId: z.number(),
  // ZMIANA: Dodajemy .transform(val => val ?? 0), aby typ był zawsze 'number'
  spell1Id: z.number().nullable().optional().transform(val => val ?? 0),
  spell2Id: z.number().nullable().optional().transform(val => val ?? 0),
  championId: z.number(),
  profileIconId: z.number().nullable().optional().default(0),
  summonerName: z.string().optional(),
  riotId: z.string().optional(),
  bot: z.boolean().optional().default(false),
  summonerId: z.string().optional(),
  puuid: z.string().optional(),
  
  gameCustomizationObjects: z.array(z.any()).nullable().optional().default([]),
  perks: LivePerksSchema.optional(),
}).passthrough();

const BannedChampionSchema = z.object({
  championId: z.number(),
  teamId: z.number(),
  pickTurn: z.number(),
}).passthrough(); // <--- Ważne: Riot czasem dodaje tu śmieci

const ObserversSchema = z.object({
    encryptionKey: z.string().optional()
}).passthrough();

// ==========================================
// 2. MAIN SCHEMA
// ==========================================

const LiveGameSchema = z.object({
  gameId: z.number(),
  mapId: z.number(),
  gameMode: z.string(),
  gameType: z.string(),
  
  // Queue Config może być nullem lub 0
  gameQueueConfigId: z.number().nullable().optional(),
  participants: z.array(LiveParticipantSchema).default([]),
  // KLUCZOWA ZMIANA: Obsługa nulla dla banów
  bannedChampions: z.array(BannedChampionSchema)
    .nullable()           // Pozwala na null
    .optional()           // Pozwala na undefined
    .transform(val => val ?? []), // Zamienia null/undefined na []
    
  gameStartTime: z.number().nullable().optional().default(0),
  gameLength: z.number(),
  platformId: z.string().optional(),
  
  observers: ObserversSchema.nullable().optional(),
}).passthrough();

// ==========================================
// 3. TYPES & FETCH FUNCTION
// ==========================================

export type LiveGameDTO = z.infer<typeof LiveGameSchema>;
export type LiveParticipantDTO = z.infer<typeof LiveParticipantSchema>;

export const fetchLiveGame = async (puuid: string, region: string): Promise<LiveGameDTO | null> => {
  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(`${apiUrl}/api/spectator/${region}/${puuid}`);
    
    if (!response.ok) {
      if (response.status === 404) return null; // Gracz nie jest w grze
      throw new Error(`API Error: ${response.status}`);
    }
    
    const rawData = await response.json();

    const result = LiveGameSchema.safeParse(rawData);

    if (!result.success) {
      // Wypisujemy dokładny błąd, żeby wiedzieć co poprawić w przyszłości
      console.error("❌ Zod Validation Error (Live Game):", result.error.format());
      
      // FALLBACK: Zwracamy surowe dane rzutowane na typ, żeby aplikacja działała
      // nawet jak schema jest zbyt restrykcyjna. To bezpiecznik na produkcji.
      console.warn("⚠️ Using raw data fallback due to validation error.");
      return rawData as LiveGameDTO;
    }

    return result.data;

  } catch (error) {
    console.error("Błąd w fetchLiveGame:", error);
    throw error;
  }
};