// // src/types/types.ts

// // ==========================================
// // SUMMONER TYPES (Dane Przywoływacza)
// // ==========================================

// export interface RiotAccountDTO {
//     puuid: string;
//     gameName: string;
//     tagLine: string;
// }
// export interface SummonerV4DTO {
//     id: string;            
//     accountId: string;     
//     puuid: string;
//     profileIconId: number;
//     revisionDate: number;
//     summonerLevel: number;
// }

// export interface SummonerProfileInfoType extends RiotAccountDTO, SummonerV4DTO {}

// export interface SummonerDataType extends SummonerProfileInfoType {
//   rankedData?: RankedDataType[];
//   matchHistory?: string[];
//   matchDetails?: MatchDetailsType[];
// }

// export interface FullSummonerState {
//   puuid: string;
//   gameName: string;
//   tagLine: string;
//   summonerLevel?: number;
//   profileIconId?: number;
//   rankedData?: RankedDataType[];
//   matchHistory?: string[];
//   matchDetails?: MatchDetailsType[];
// }

// // ==========================================
// // RANKED TYPES (Dane Rankingowe)
// // ==========================================

// export interface RankedDataType {
//   leagueId: string;
//   queueType: string;
//   tier: string;
//   rank: string;
//   leaguePoints: number;
//   wins: number;
//   losses: number;
//   veteran: boolean;
//   inactive: boolean;
//   freshBlood: boolean;
//   hotStreak: boolean;
// }

// // ==========================================
// // MATCH & GAME TYPES (Struktura Meczu)
// // ==========================================



// export interface MatchDetailsType {
//   metadata: MetadataType;
//   info: Info;
// }

// export interface MatchDTO {
//   metadata: MetadataType;
//   info: Info;
// }

// export interface MetadataType {
//   dataVersion: string;
//   matchId: string;
//   participants: string[];
// }

// export interface Info {
//   endOfGameResult?: string; 
//   gameCreation: number;
//   gameDuration: number;
//   gameEndTimestamp?: number; // Opcjonalne w Zod
//   gameId: number;
//   gameMode: string;
//   gameName?: string;         // Opcjonalne
//   gameStartTimestamp?: number; // Opcjonalne
//   gameType: string;
//   gameVersion?: string;      // Opcjonalne
//   mapId: number;
//   participants: ParticipantType[];
//   platformId?: string;       // Opcjonalne
//   queueId: number;
//   teams?: Team[];            // Opcjonalne w Zod (np. Arena)
//   tournamentCode?: string;   // Opcjonalne
// }

// // ==========================================
// // TEAMS & OBJECTIVES
// // ==========================================

// export interface Team {
//   bans?: Ban[];          // Opcjonalne
//   objectives?: Objectives ; // Opcjonalne
//   teamId: number;
//   win: boolean;
// }

// export interface Ban {
//   championId: number;
//   pickTurn: number;
// }


// export interface Objectives {
//   atakhan: Atakhan;
//   baron: Baron;
//   champion: Champion;
//   dragon: Dragon;
//   horde:Horde;
//   inhibitor: Inhibitor;
//   riftHerald: RiftHerald;
//   tower: Tower;
// }
// export interface Horde {
//   first: boolean;
//   kills: number;
// }

// export interface Atakhan {
//   first?: boolean;
//   kills?: number;
// }

// export interface Baron {
//   first: boolean;
//   kills: number;
// }

// export interface Champion {
//   first: boolean;
//   kills: number;
// }

// export interface Dragon {
//   first: boolean;
//   kills: number;
// }

// export interface Inhibitor {
//   first: boolean;
//   kills: number;
// }

// export interface RiftHerald {
//   first: boolean;
//   kills: number;
// }

// export interface Tower {
//   first: boolean;
//   kills: number;
// }

// // ==========================================
// // PARTICIPANT & STATS 
// // ==========================================



// export interface ParticipantType {
//   // --- Kluczowe pola (zawsze obecne w Twoim Zod schema) ---
//   participantId: number;
//   teamId: number;
//   championId: number;
//   championName: string;
//   win: boolean;
  
//   kills: number;
//   deaths: number;
//   assists: number;
//   kda?: number; // Obliczane lub opcjonalne
  
//   totalDamageDealtToChampions: number;
//   totalMinionsKilled: number;
//   goldEarned: number;
//   champLevel: number;
  
//   item0: number;
//   item1: number;
//   item2: number;
//   item3: number;
//   item4: number;
//   item5: number;
//   item6: number;

//   // --- Pola opcjonalne lub nullable w Zod ---
//   puuid?: string | null;            
//   summonerName?: string | null;
//   riotIdGameName?: string | null;
//   riotIdTagline?: string | null;
  
//   lane?: string | null;
//   role?: string | null;
//   individualPosition?: string | null;
  
//   neutralMinionsKilled?: number;
//   visionScore?: number;
  
//   perks?: PerksType; // Opcjonalne w Zod
//   challenges?: Record<string, any>; // Zod pozwala na any

//   // --- Pola, których Zod w fetchMatchDetails w ogóle nie definiuje ---
//   // Muszą być oznaczone jako opcjonalne (?), żeby TypeScript nie krzyczał, że ich brakuje.
  
//   assists_kda?: number;
//   baronKills?: number;
//   bountyLevel?: number;
//   champExperience?: number;
//   championTransform?: number;
//   consumablesPurchased?: number;
//   damageDealtToBuildings?: number;
//   damageDealtToObjectives?: number;
//   damageDealtToTurrets?: number;
//   damageSelfMitigated?: number;
//   detectorWardsPlaced?: number;
//   doubleKills?: number;
//   dragonKills?: number;
//   firstBloodAssist?: boolean;
//   firstBloodKill?: boolean;
//   firstTowerAssist?: boolean;
//   firstTowerKill?: boolean;
//   gameEndedInEarlySurrender?: boolean;
//   gameEndedInSurrender?: boolean;
//   goldSpent?: number;
//   inhibitorKills?: number;
//   inhibitorTakedowns?: number;
//   inhibitorsLost?: number;
//   itemsPurchased?: number;
//   killingSprees?: number;
//   largestCriticalStrike?: number;
//   largestKillingSpree?: number;
//   largestMultiKill?: number;
//   longestTimeSpentLiving?: number;
//   magicDamageDealt?: number;
//   magicDamageDealtToChampions?: number;
//   magicDamageTaken?: number;
//   nexusKills?: number;
//   nexusLost?: number;
//   nexusTakedowns?: number;
//   objectivesStolen?: number;
//   objectivesStolenAssists?: number;
//   pentaKills?: number;
//   physicalDamageDealt?: number;
//   physicalDamageDealtToChampions?: number;
//   physicalDamageTaken?: number;
//   profileIcon?: number;
//   quadraKills?: number;
//   sightWardsBoughtInGame?: number;
//   spell1Casts?: number;
//   spell2Casts?: number;
//   spell3Casts?: number;
//   spell4Casts?: number;
//   summoner1Casts?: number;
//   summoner1Id?: number;
//   summoner2Casts?: number;
//   summoner2Id?: number;
//   summonerId?: string;
//   summonerLevel?: number;
//   teamEarlySurrendered?: boolean;
//   teamPosition?: string;
//   timeCCingOthers?: number;
//   timePlayed?: number;
//   totalDamageDealt?: number;
//   totalDamageShieldedOnTeammates?: number;
//   totalDamageTaken?: number;
//   totalHeal?: number;
//   totalHealsOnTeammates?: number;
//   totalTimeCCDealt?: number;
//   totalTimeSpentDead?: number;
//   totalUnitsHealed?: number;
//   tripleKills?: number;
//   trueDamageDealt?: number;
//   trueDamageDealtToChampions?: number;
//   trueDamageTaken?: number;
//   turretKills?: number;
//   turretTakedowns?: number;
//   turretsLost?: number;
//   unrealKills?: number;
//   visionWardsBoughtInGame?: number;
//   wardsKilled?: number;
//   wardsPlaced?: number;
//   riftHeraldKills?: number;
// }

// export interface PerksType {
//   statPerks?: StatPerksType; // Opcjonalne
//   styles: StyleType[];
// }

// export interface StyleType {
//   description: string;
//   selections: Selection[];
//   style: number;
// }

// export interface Selection {
//   perk: number;
//   var1: number;
//   var2: number;
//   var3: number;
// }

// export interface StatPerksType {
//   defense: number;
//   flex: number;
//   offense: number;
// }

// // ==========================================
// // LIVE GAME & SPECTATOR
// // ==========================================

// export interface BannedChampion {
//   championId: number;
//   teamId: number;
//   pickTurn: number;
// }

// export interface Observer {
//   encryptionKey: string;
// }

// export interface CurrentGameParticipant {
//   championId: number;
//   perks: PerksType | any; 
//   profileIconId: number;
//   bot: boolean;
//   teamId: number;
//   summonerName: string;
//   summonerId: string;
//   spell1Id: number;
//   spell2Id: number;
//   riotId: string; 
//   gameCustomizationObjects: any[]; 
// }

// export interface LiveGameDTO {
//   gameId: number;
//   mapId: number;
//   gameMode: string;
//   gameType: string;
//   gameQueueConfigId?: number;
//   participants: CurrentGameParticipant[];
//   observers: Observer;
//   platformId: string;
//   bannedChampions: BannedChampion[];
//   gameStartTime: number;
//   gameLength: number;
// }