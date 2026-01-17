// ==========================================
// PERKS (RUNY)
// ==========================================
export interface StatPerksType {
  defense: number;
  flex: number;
  offense: number;
}

export interface Selection {
  perk: number;
  var1: number;
  var2: number;
  var3: number;
}

export interface StyleType {
  description: string;
  selections: Selection[];
  style: number;
}

export interface PerksType {
  statPerks?: StatPerksType; // Opcjonalne
  styles: StyleType[];
}

// ==========================================
// MAIN PARTICIPANT
// ==========================================
export interface ParticipantType {
  // --- Kluczowe pola ---
  participantId: number;
  teamId: number;
  championId: number;
  championName: string;
  win: boolean;
  
  kills: number;
  deaths: number;
  assists: number;
  kda?: number;
  
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  goldEarned: number;
  champLevel: number;
  
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;

  // --- Pola opcjonalne / nullable ---
  puuid?: string | null;            
  summonerName?: string | null;
  riotIdGameName?: string | null;
  riotIdTagline?: string | null;
  
  lane?: string | null;
  role?: string | null;
  individualPosition?: string | null;
  
  neutralMinionsKilled?: number;
  visionScore?: number;
  
  perks?: PerksType; 
  challenges?: Record<string, any>; 

  // --- Reszta statystyk ---
  assists_kda?: number;
  baronKills?: number;
  bountyLevel?: number;
  champExperience?: number;
  championTransform?: number;
  consumablesPurchased?: number;
  damageDealtToBuildings?: number;
  damageDealtToObjectives?: number;
  damageDealtToTurrets?: number;
  damageSelfMitigated?: number;
  detectorWardsPlaced?: number;
  doubleKills?: number;
  dragonKills?: number;
  firstBloodAssist?: boolean;
  firstBloodKill?: boolean;
  firstTowerAssist?: boolean;
  firstTowerKill?: boolean;
  gameEndedInEarlySurrender?: boolean;
  gameEndedInSurrender?: boolean;
  goldSpent?: number;
  inhibitorKills?: number;
  inhibitorTakedowns?: number;
  inhibitorsLost?: number;
  itemsPurchased?: number;
  killingSprees?: number;
  largestCriticalStrike?: number;
  largestKillingSpree?: number;
  largestMultiKill?: number;
  longestTimeSpentLiving?: number;
  magicDamageDealt?: number;
  magicDamageDealtToChampions?: number;
  magicDamageTaken?: number;
  nexusKills?: number;
  nexusLost?: number;
  nexusTakedowns?: number;
  objectivesStolen?: number;
  objectivesStolenAssists?: number;
  pentaKills?: number;
  physicalDamageDealt?: number;
  physicalDamageDealtToChampions?: number;
  physicalDamageTaken?: number;
  profileIcon?: number;
  quadraKills?: number;
  sightWardsBoughtInGame?: number;
  spell1Casts?: number;
  spell2Casts?: number;
  spell3Casts?: number;
  spell4Casts?: number;
  summoner1Casts?: number;
  summoner1Id?: number;
  summoner2Casts?: number;
  summoner2Id?: number;
  summonerId?: string;
  summonerLevel?: number;
  teamEarlySurrendered?: boolean;
  teamPosition?: string;
  timeCCingOthers?: number;
  timePlayed?: number;
  totalDamageDealt?: number;
  totalDamageShieldedOnTeammates?: number;
  totalDamageTaken?: number;
  totalHeal?: number;
  totalHealsOnTeammates?: number;
  totalTimeCCDealt?: number;
  totalTimeSpentDead?: number;
  totalUnitsHealed?: number;
  tripleKills?: number;
  trueDamageDealt?: number;
  trueDamageDealtToChampions?: number;
  trueDamageTaken?: number;
  turretKills?: number;
  turretTakedowns?: number;
  turretsLost?: number;
  unrealKills?: number;
  visionWardsBoughtInGame?: number;
  wardsKilled?: number;
  wardsPlaced?: number;
  riftHeraldKills?: number;
}