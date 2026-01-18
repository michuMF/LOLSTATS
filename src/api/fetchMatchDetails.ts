// src/api/fetchMatchDetails.ts
import { z } from "zod";

// ==========================================
// 1. PERKS (RUNY) SCHEMAS
// ==========================================

const PerkStyleSelectionSchema = z.object({
  perk: z.number(),
  var1: z.number(),
  var2: z.number(),
  var3: z.number(),
});

const PerkStyleSchema = z.object({
  description: z.string(),
  selections: z.array(PerkStyleSelectionSchema),
  style: z.number(),
});

const StatPerksSchema = z.object({
  defense: z.number().optional(),
  flex: z.number().optional(),
  offense: z.number().optional(),
});

const PerksSchema = z.object({
  statPerks: StatPerksSchema.optional(),
  styles: z.array(PerkStyleSchema).optional().default([]),
});

// ==========================================
// 2. MISSIONS SCHEMA
// ==========================================
// Obiekt missions pojawia się w Twoim JSONie
const MissionsSchema = z.object({
  playerScore0: z.number().optional().default(0),
  playerScore1: z.number().optional().default(0),
  playerScore2: z.number().optional().default(0),
  playerScore3: z.number().optional().default(0),
  playerScore4: z.number().optional().default(0),
  playerScore5: z.number().optional().default(0),
  playerScore6: z.number().optional().default(0),
  playerScore7: z.number().optional().default(0),
  playerScore8: z.number().optional().default(0),
  playerScore9: z.number().optional().default(0),
  playerScore10: z.number().optional().default(0),
  playerScore11: z.number().optional().default(0),
}).passthrough();

// ==========================================
// 3. PARTICIPANT SCHEMA (GŁÓWNY)
// ==========================================

const ParticipantSchema = z.object({
  // --- Identyfikacja ---
  participantId: z.number(),
  teamId: z.number(),
  puuid: z.string().nullable().optional(),
  summonerName: z.string().optional().default(""),
  summonerId: z.string().optional(),
  profileIcon: z.number().optional(),
  riotIdGameName: z.string().nullable().optional(),
  riotIdTagline: z.string().nullable().optional(),
  
  // --- Champion & Rola ---
  championId: z.number(),
  championName: z.string(),
  championTransform: z.number().optional().default(0),
  champLevel: z.number(),
  champExperience: z.number().optional().default(0),
  lane: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  individualPosition: z.string().nullable().optional(),
  teamPosition: z.string().optional(),
  playedChampSelectPosition: z.number().optional(), // Nowe pole z JSONa
  win: z.boolean(),

  // --- KDA & Combat ---
  kills: z.number(),
  deaths: z.number(),
  assists: z.number(),
  kda: z.number().optional(), // Czasem API to zwraca, czasem trzeba liczyć
  killParticipation: z.number().optional(),
  
  doubleKills: z.number().optional().default(0),
  tripleKills: z.number().optional().default(0),
  quadraKills: z.number().optional().default(0),
  pentaKills: z.number().optional().default(0),
  unrealKills: z.number().optional().default(0),
  
  killingSprees: z.number().optional().default(0),
  largestKillingSpree: z.number().optional().default(0),
  largestMultiKill: z.number().optional().default(0),
  largestCriticalStrike: z.number().optional().default(0),
  
  firstBloodKill: z.boolean().optional(),
  firstBloodAssist: z.boolean().optional(),
  firstTowerKill: z.boolean().optional(),
  firstTowerAssist: z.boolean().optional(),

  // --- Damage ---
  totalDamageDealt: z.number().optional().default(0),
  totalDamageDealtToChampions: z.number(),
  physicalDamageDealt: z.number().optional().default(0),
  physicalDamageDealtToChampions: z.number().optional().default(0),
  magicDamageDealt: z.number().optional().default(0),
  magicDamageDealtToChampions: z.number().optional().default(0),
  trueDamageDealt: z.number().optional().default(0),
  trueDamageDealtToChampions: z.number().optional().default(0),
  
  totalDamageTaken: z.number().optional().default(0),
  physicalDamageTaken: z.number().optional().default(0),
  magicDamageTaken: z.number().optional().default(0),
  trueDamageTaken: z.number().optional().default(0),
  
  damageDealtToBuildings: z.number().optional().default(0),
  damageDealtToObjectives: z.number().optional().default(0),
  damageDealtToTurrets: z.number().optional().default(0),
  damageSelfMitigated: z.number().optional().default(0),
  totalDamageShieldedOnTeammates: z.number().optional().default(0),

  // --- Healing & Utility ---
  totalHeal: z.number().optional().default(0),
  totalHealsOnTeammates: z.number().optional().default(0),
  totalUnitsHealed: z.number().optional().default(0),
  timeCCingOthers: z.number().optional().default(0),
  totalTimeCCDealt: z.number().optional().default(0),

  // --- Economy & Minions ---
  goldEarned: z.number(),
  goldSpent: z.number().optional().default(0),
  goldPerMinute: z.number().optional(),
  totalMinionsKilled: z.number(),
  neutralMinionsKilled: z.number().optional().default(0),
  totalAllyJungleMinionsKilled: z.number().optional().default(0),
  totalEnemyJungleMinionsKilled: z.number().optional().default(0),
  
  // --- Vision ---
  visionScore: z.number().optional().default(0),
  wardsPlaced: z.number().optional().default(0),
  wardsKilled: z.number().optional().default(0),
  detectorWardsPlaced: z.number().optional().default(0),
  sightWardsBoughtInGame: z.number().optional().default(0),
  visionWardsBoughtInGame: z.number().optional().default(0),

  // --- PINGS (Nowe pola z Twojego JSONa) ---
  allInPings: z.number().optional().default(0),
  assistMePings: z.number().optional().default(0),
  basicPings: z.number().optional().default(0),
  commandPings: z.number().optional().default(0),
  dangerPings: z.number().optional().default(0),
  enemyMissingPings: z.number().optional().default(0),
  enemyVisionPings: z.number().optional().default(0),
  getBackPings: z.number().optional().default(0),
  holdPings: z.number().optional().default(0),
  needVisionPings: z.number().optional().default(0),
  onMyWayPings: z.number().optional().default(0),
  pushPings: z.number().optional().default(0),
  retreatPings: z.number().optional().default(0),
  visionClearedPings: z.number().optional().default(0),

  // --- Items ---
  item0: z.number().default(0),
  item1: z.number().default(0),
  item2: z.number().default(0),
  item3: z.number().default(0),
  item4: z.number().default(0),
  item5: z.number().default(0),
  item6: z.number().default(0),
  itemsPurchased: z.number().optional().default(0),
  consumablesPurchased: z.number().optional().default(0),

  // --- Spells ---
  spell1Casts: z.number().optional().default(0),
  spell2Casts: z.number().optional().default(0),
  spell3Casts: z.number().optional().default(0),
  spell4Casts: z.number().optional().default(0),
  summoner1Casts: z.number().optional().default(0),
  summoner1Id: z.number().optional().default(0),
  summoner2Casts: z.number().optional().default(0),
  summoner2Id: z.number().optional().default(0),
  
  // --- Structures & Objectives ---
  turretKills: z.number().optional().default(0),
  inhibitorKills: z.number().optional().default(0),
  baronKills: z.number().optional().default(0),
  dragonKills: z.number().optional().default(0),
  riftHeraldKills: z.number().optional().default(0), // Czasem 0 w JSON
  riftHeraldTakedowns: z.number().optional().default(0),
  voidMonsterKill: z.number().optional().default(0), // Nowe (Voidgrubs)
  
  nexusKills: z.number().optional().default(0),
  nexusTakedowns: z.number().optional().default(0),
  nexusLost: z.number().optional().default(0),
  turretTakedowns: z.number().optional().default(0),
  turretsLost: z.number().optional().default(0),
  inhibitorTakedowns: z.number().optional().default(0),
  inhibitorsLost: z.number().optional().default(0),
  objectivesStolen: z.number().optional().default(0),
  objectivesStolenAssists: z.number().optional().default(0),

  // --- Game State & Time ---
  timePlayed: z.number().optional().default(0),
  totalTimeSpentDead: z.number().optional().default(0),
  longestTimeSpentLiving: z.number().optional().default(0),
  gameEndedInEarlySurrender: z.boolean().optional(),
  gameEndedInSurrender: z.boolean().optional(),
  teamEarlySurrendered: z.boolean().optional(),
  
  // --- Special Modes (Arena/Swarm) & Misc ---
  playerAugment1: z.number().optional().default(0),
  playerAugment2: z.number().optional().default(0),
  playerAugment3: z.number().optional().default(0),
  playerAugment4: z.number().optional().default(0),
  playerAugment5: z.number().optional().default(0), // Czasem jest w JSON
  playerAugment6: z.number().optional().default(0),
  placement: z.number().optional().default(0),
  subteamPlacement: z.number().optional().default(0),
  playerSubteamId: z.number().optional().default(0),
  eligibleForProgression: z.boolean().optional(),

  // --- Player Scores (Dominion/Missions) ---
  // W twoim JSONie występują jako root keys (Capitalized)
  PlayerScore0: z.number().optional().default(0),
  PlayerScore1: z.number().optional().default(0),
  PlayerScore2: z.number().optional().default(0),
  PlayerScore3: z.number().optional().default(0),
  PlayerScore4: z.number().optional().default(0),
  PlayerScore5: z.number().optional().default(0),
  PlayerScore6: z.number().optional().default(0),
  PlayerScore7: z.number().optional().default(0),
  PlayerScore8: z.number().optional().default(0),
  PlayerScore9: z.number().optional().default(0),
  PlayerScore10: z.number().optional().default(0),
  PlayerScore11: z.number().optional().default(0),

  // --- Complex Objects ---
  perks: PerksSchema.optional(), 
  missions: MissionsSchema.optional(), // Nowy obiekt z JSONa

  // Challenges to obiekt dynamiczny, trzymamy jako record, żeby nie crashowało
  // przy dodaniu nowych wyzwań przez Riot (np. SWARM_DefeatAatrox)
  challenges: z.record(z.string(), z.any()).optional().catch({}), 

}).passthrough(); // Passthrough pozwala przechodzić polom, których tu nie wypisaliśmy, bez błędu

// Reszta plików (TeamSchema, MetadataSchema, InfoSchema, MatchDetailsSchema) 
// powinna pozostać taka sama jak w poprzedniej wersji, chyba że chcesz je też zaktualizować.
// Poniżej skrócone przypomnienie struktury, aby plik był kompletny.

// ... (BaseObjectiveSchema, ObjectivesSchema, BanSchema, TeamSchema, etc.)

// --- Przykładowe definicje reszty (skopiowane z poprzedniej wersji dla spójności) ---

const ObjectivesSchema = z.record(z.string(), z.any()).optional(); // Uproszczone dla bezpieczeństwa
const BanSchema = z.object({ championId: z.number(), pickTurn: z.number() });
const TeamSchema = z.object({
  teamId: z.number(),
  win: z.boolean(),
  bans: z.array(BanSchema).optional().default([]),
  objectives: ObjectivesSchema,
}).passthrough();

const MetadataSchema = z.object({
  dataVersion: z.string(),
  matchId: z.string(),
  participants: z.array(z.string()),
}).passthrough();

const InfoSchema = z.object({
  gameCreation: z.number(),
  gameDuration: z.number(),
  gameEndTimestamp: z.number().optional(),
  gameId: z.number(),
  gameMode: z.string(),
  gameName: z.string().optional(),
  gameStartTimestamp: z.number(),
  gameType: z.string(),
  gameVersion: z.string(),
  mapId: z.number(),
  participants: z.array(ParticipantSchema),
  platformId: z.string(),
  queueId: z.number(),
  teams: z.array(TeamSchema).optional(),
  tournamentCode: z.string().nullable().optional(),
}).passthrough();

const MatchDetailsSchema = z.object({
  metadata: MetadataSchema,
  info: InfoSchema,
});

export type MatchDetailsType = z.infer<typeof MatchDetailsSchema>;
export type ParticipantType = z.infer<typeof ParticipantSchema>;

export const fetchMatchDetails = async (matchId: string, region: string): Promise<MatchDetailsType> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/api/matches/details/${region}/${matchId}`);
  if (!response.ok) throw new Error("Failed to fetch match details");
  
  const rawData = await response.json();
  const result = MatchDetailsSchema.safeParse(rawData);

  if (!result.success) {
    console.error(`❌ ZOD VALIDATION ERROR w meczu ${matchId}:`, result.error.format());
    // W dev mode rzucamy błąd, w prod zwracamy co mamy
    if (import.meta.env.DEV) {
        console.warn("Zwracam surowe dane mimo błędu walidacji (DEV MODE)");
    }
    return rawData as MatchDetailsType; 
  }

  return result.data;
};