import { z } from "zod";

// --- Pod-schematy ---

const PerkStyleSelectionSchema = z.object({
  perk: z.number(),
  var1: z.number(),
  var2: z.number(),
  var3: z.number(),
}).passthrough(); // <--- ZMIANA: Ignoruj dziwne dodatkowe pola w runach

const PerkStyleSchema = z.object({
  description: z.string(),
  selections: z.array(PerkStyleSelectionSchema),
  style: z.number(),
}).passthrough();

const ParticipantSchema = z.object({
  // Pola identyfikacyjne czasem są null (np. dla botów lub odłączonych graczy)
  puuid: z.string().nullable().optional(), 
  summonerName: z.string().optional(),
  riotIdGameName: z.string().nullable().optional(),
  riotIdTagline: z.string().nullable().optional(),
  
  participantId: z.number(),
  teamId: z.number(),
  championId: z.number(),
  championName: z.string(),
  lane: z.string().nullable().optional(), // ARAM nie ma linii
  role: z.string().nullable().optional(),
  individualPosition: z.string().nullable().optional(), // ARAM/Arena często ma tu "Invalid" lub null
  win: z.boolean(),
  
  // Statystyki
  kills: z.number(),
  deaths: z.number(),
  assists: z.number(),
  kda: z.number().optional(), 
  totalDamageDealtToChampions: z.number(),
  totalMinionsKilled: z.number(),
  neutralMinionsKilled: z.number().optional().default(0), // Czasem brak w Arena/ARAM
  goldEarned: z.number(),
  champLevel: z.number(),
  visionScore: z.number().optional().default(0),
  
  // Itemy (zawsze są, ale dla bezpieczeństwa default 0)
  item0: z.number().default(0),
  item1: z.number().default(0),
  item2: z.number().default(0),
  item3: z.number().default(0),
  item4: z.number().default(0),
  item5: z.number().default(0),
  item6: z.number().default(0),
  
  perks: z.object({
    styles: z.array(PerkStyleSchema).optional().default([]),
  }).optional(), // Stare mecze mogą nie mieć run
  
  // Challenges - to jest największe pole minowe.
  // Używamy .catch(), co oznacza: "jak się wywali, wstaw pusty obiekt zamiast crashować całą apkę"
  challenges: z.record(z.string(), z.any()).optional().catch({}), 

}).passthrough(); // <--- WAŻNE: Ignoruj tysiące innych pól, których nie używamy

const TeamSchema = z.object({
  teamId: z.number(),
  win: z.boolean(),
  bans: z.array(z.any()).optional().default([]), // Bany czasem są dziwne, olewamy strukturę, bierzemy any
  objectives: z.record(z.string(), z.any()).optional(), // To samo z objectives
}).passthrough();

const MetadataSchema = z.object({
  dataVersion: z.string(),
  matchId: z.string(),
  participants: z.array(z.string()),
}).passthrough();

const InfoSchema = z.object({
  endOfGameResult: z.string(),
  gameCreation: z.number(),
  gameDuration: z.number(),
  gameEndTimestamp: z.number(),
  gameId: z.number(),
  gameMode: z.string(),
  gameName: z.string(),
  gameStartTimestamp: z.number(),
  gameType: z.string(),
  mapId: z.number(),
  participants: z.array(ParticipantSchema),
  queueId: z.number(),
  platformId: z.string(),
  teams: z.array(TeamSchema).optional(), // Arena mode może mieć inną strukturę teamów
  
}).passthrough();


console.log(InfoSchema);

const MatchDetailsSchema = z.object({
  metadata: MetadataSchema,
  info: InfoSchema,
});

export type MatchDetailsType = z.infer<typeof MatchDetailsSchema>;

export const fetchMatchDetails = async (matchId: string, region: string): Promise<MatchDetailsType> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  
  const response = await fetch(`${apiUrl}/api/matches/details/${region}/${matchId}`);
  if (!response.ok) throw new Error("Failed to fetch match details");
  
  const rawData = await response.json();

  // DEBUG: Jeśli walidacja failuje, zobaczysz to w konsoli przeglądarki
  const result = MatchDetailsSchema.safeParse(rawData);
  
  if (!result.success) {
    console.error(`❌ ZOD ERROR w meczu ${matchId}:`, result.error.format());
    // Fallback: W razie błędu walidacji zwróć surowe dane jako 'any' (żeby apka nie padła całkowicie),
    // ale dzięki logowi wyżej wiesz, co naprawić.
    return rawData as MatchDetailsType; 
  }

  return result.data;
};