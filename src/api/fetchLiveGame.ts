import { z } from "zod";

// --- SCHEMATY ---

// Poluzowany schemat perksów. W API Spectator v5 to często prosta lista ID.
const LivePerksSchema = z.object({
  perkIds: z.array(z.number()),
  perkStyle: z.number(),
  perkSubStyle: z.number(),
}).passthrough(); // .passthrough() pozwala na dodatkowe pola bez błędu

const LiveParticipantSchema = z.object({
  teamId: z.number(),
  spell1Id: z.number(),
  spell2Id: z.number(),
  championId: z.number(),
  profileIconId: z.number(),
  summonerName: z.string().optional(),
  riotId: z.string().optional(),
  bot: z.boolean(),
  summonerId: z.string(),
  perks: LivePerksSchema.optional(), // Perki mogą być opcjonalne (np. dla botów)
}).passthrough(); 

const BannedChampionSchema = z.object({
  championId: z.number(),
  teamId: z.number(),
  pickTurn: z.number(),
});

const LiveGameSchema = z.object({
  gameId: z.number(),
  mapId: z.number(),
  gameMode: z.string(),
  gameType: z.string(),
  // gameQueueConfigId bywa nullem w customach lub 0
  gameQueueConfigId: z.number().nullable().optional(), 
  participants: z.array(LiveParticipantSchema),
  bannedChampions: z.array(BannedChampionSchema).optional().default([]),
  gameStartTime: z.number(),
  gameLength: z.number(),
  platformId: z.string(),
}).passthrough();

// Eksportujemy wywnioskowane typy, aby używać ich w komponentach
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

    // --- ULEPSZONA WALIDACJA (Safe Parsing) ---
    // Zamiast rzucać błąd przy pierwszym niezgodnym polu, sprawdzamy sukces operacji.
    const result = LiveGameSchema.safeParse(rawData);

    if (!result.success) {
      // To jest KLUCZOWE dla debugowania. W konsoli zobaczysz, którego pola brakuje.
      console.error("❌ Zod Validation Error:", result.error.format());
      // Opcjonalnie: Możesz zwrócić rawData rzutowane na 'unknown as LiveGameDTO' 
      // jeśli chcesz pokazać dane mimo błędów, ale lepiej naprawić schemat.
      throw new Error("Błąd walidacji danych z API Riot");
    }

    return result.data;

  } catch (error) {
    console.error("Błąd w fetchLiveGame:", error);
    throw error;
  }
};