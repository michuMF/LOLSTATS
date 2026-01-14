import { z } from "zod";

// Pomocniczy schemat uczestnika gry live
const LiveParticipantSchema = z.object({
  teamId: z.number(),
  spell1Id: z.number(),
  spell2Id: z.number(),
  championId: z.number(),
  profileIconId: z.number(),
  summonerName: z.string().optional(), // W nowym API czasem jest puste
  riotId: z.string().optional(),       // Nowe pole identyfikacji
  bot: z.boolean(),
  summonerId: z.string(),
  perks: z.object({
    perkIds: z.array(z.number()),
    perkStyle: z.number(),
    perkSubStyle: z.number(),
  }),
});

// Schemat banów
const BannedChampionSchema = z.object({
  championId: z.number(),
  teamId: z.number(),
  pickTurn: z.number(),
});

// Główny schemat gry live
const LiveGameSchema = z.object({
  gameId: z.number(),
  mapId: z.number(),
  gameMode: z.string(),
  gameType: z.string(),
  gameQueueConfigId: z.number().optional(), // Czasem customy nie mają ID kolejki
  participants: z.array(LiveParticipantSchema),
  bannedChampions: z.array(BannedChampionSchema).optional().default([]), // Może nie być banów (ARAM/Blind)
  gameStartTime: z.number(),
  gameLength: z.number(),
  platformId: z.string(),
});

export type LiveGameDTO = z.infer<typeof LiveGameSchema>;

export const fetchLiveGame = async (puuid: string, region: string): Promise<LiveGameDTO | null> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(region);
  console.log(puuid);
  
  

  const response = await fetch(`${apiUrl}/api/spectator/${region}/${puuid}`);
  
  if (!response.ok) {
    if (response.status === 404) return null; // Gracz nie jest w grze - to nie jest błąd
   
    
    throw new Error('Błąd pobierania gry live');
  }
  
  const rawData = await response.json();

  // Walidacja struktury
  return LiveGameSchema.parse(rawData);
};