// ==========================================
// SUMMONER TYPES (Dane Przywoływacza)
// ==========================================

export interface RiotAccountDTO {
    puuid: string;
    gameName: string;
    tagLine: string;
}
export interface SummonerV4DTO {
    id: string;            // Encrypted Summoner ID
    accountId: string;     // Encrypted Account ID
    puuid: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
}

export interface SummonerProfileInfoType extends RiotAccountDTO, SummonerV4DTO {}

export interface SummonerDataType extends SummonerProfileInfoType {
  rankedData?: RankedDataType[];
  matchHistory?: string[];
  matchDetails?: MatchDetailsType[];
}

export interface FullSummonerState {
  puuid: string;
  gameName: string;
  tagLine: string;
  summonerLevel?: number;
  profileIconId?: number;
  rankedData?: RankedDataType[];
  matchHistory?: string[];
  matchDetails?: MatchDetailsType[];
}

// ==========================================
// RANKED TYPES (Dane Rankingowe)
// ==========================================

export interface RankedDataType {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

// ==========================================
// MATCH & GAME TYPES (Struktura Meczu)
// ==========================================

export interface MatchDetailsType {
  metadata: MetadataType;
  info: Info;
}

export interface MatchDTO {
  metadata: MetadataType;
  info: Info;
}

export interface MetadataType {
  dataVersion: string;
  matchId: string;
  participants: string[];
}

export interface Info {
  endOfGameResult?: string; // Dodano opcjonalnie, bo występowało w MatchDetailsType
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp: number;
  gameId: number;
  gameMode: string;
  gameName: string;
  gameStartTimestamp: number;
  gameType: string;
  gameVersion: string;
  mapId: number;
  participants: ParticipantType[];
  platformId: string;
  queueId: number;
  teams: Team[];
  tournamentCode: string;
}

// ==========================================
// TEAMS & OBJECTIVES (Drużyny i Cele)
// ==========================================

export interface Team {
  bans: Ban[];
  objectives: Objectives;
  teamId: number;
  win: boolean;
}

export interface Ban {
  championId: number;
  pickTurn: number;
}

export interface Objectives {
  baron: Baron;
  champion: Champion;
  dragon: Dragon;
  inhibitor: Inhibitor;
  riftHerald: RiftHerald;
  tower: Tower;
}

export interface Baron {
  first: boolean;
  kills: number;
}

export interface Champion {
  first: boolean;
  kills: number;
}

export interface Dragon {
  first: boolean;
  kills: number;
}

export interface Inhibitor {
  first: boolean;
  kills: number;
}

export interface RiftHerald {
  first: boolean;
  kills: number;
}

export interface Tower {
  first: boolean;
  kills: number;
}

// ==========================================
// PARTICIPANT & STATS (Uczestnicy i Statystyki)
// ==========================================

export interface ParticipantType {
  assists: number;
  baronKills: number;
  bountyLevel: number;
  champExperience: number;
  champLevel: number;
  championId: number;
  championName: string;
  championTransform: number;
  consumablesPurchased: number;
  damageDealtToBuildings: number;
  damageDealtToObjectives: number;
  damageDealtToTurrets: number;
  damageSelfMitigated: number;
  deaths: number;
  detectorWardsPlaced: number;
  doubleKills: number;
  dragonKills: number;
  firstBloodAssist: boolean;
  firstBloodKill: boolean;
  firstTowerAssist: boolean;
  firstTowerKill: boolean;
  gameEndedInEarlySurrender: boolean;
  gameEndedInSurrender: boolean;
  goldEarned: number;
  goldSpent: number;
  individualPosition: string;
  inhibitorKills: number;
  inhibitorTakedowns: number;
  inhibitorsLost: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  itemsPurchased: number;
  killingSprees: number;
  kills: number;
  lane: string;
  largestCriticalStrike: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  longestTimeSpentLiving: number;
  magicDamageDealt: number;
  magicDamageDealtToChampions: number;
  magicDamageTaken: number;
  neutralMinionsKilled: number;
  nexusKills: number;
  nexusLost: number;
  nexusTakedowns: number;
  objectivesStolen: number;
  objectivesStolenAssists: number;
  participantId: number;
  pentaKills: number;
  perks: PerksType;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  physicalDamageTaken: number;
  profileIcon: number;
  puuid: string;
  quadraKills: number;
  riotIdGameName: string;
  riotIdTagline: string;
  role: string;
  sightWardsBoughtInGame: number;
  spell1Casts: number;
  spell2Casts: number;
  spell3Casts: number;
  spell4Casts: number;
  summoner1Casts: number;
  summoner1Id: number;
  summoner2Casts: number;
  summoner2Id: number;
  summonerId: string;
  summonerLevel: number;
  summonerName: string;
  teamEarlySurrendered: boolean;
  teamId: number;
  teamPosition: string;
  timeCCingOthers: number;
  timePlayed: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageShieldedOnTeammates: number;
  totalDamageTaken: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  totalMinionsKilled: number;
  totalTimeCCDealt: number;
  totalTimeSpentDead: number;
  totalUnitsHealed: number;
  tripleKills: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  trueDamageTaken: number;
  turretKills: number;
  turretTakedowns: number;
  turretsLost: number;
  unrealKills: number;
  visionScore: number;
  visionWardsBoughtInGame: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
  riftHeraldKills: number;
  challenges?: Record<string, number>;
}

export interface PerksType {
  statPerks: StatPerksType;
  styles: StyleType[];
}

export interface StyleType {
  description: string;
  selections: Selection[];
  style: number;
}

export interface Selection {
  perk: number;
  var1: number;
  var2: number;
  var3: number;
}

export interface StatPerksType {
  defense: number;
  flex: number;
  offense: number;
}