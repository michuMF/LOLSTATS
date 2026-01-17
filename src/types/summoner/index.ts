// ==========================================
// RANKED DATA

import type { MatchDetailsType } from "../../api/fetchMatchDetails";



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
// SUMMONER & ACCOUNT
// ==========================================
export interface RiotAccountDTO {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface SummonerV4DTO {
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface SummonerProfileInfoType extends RiotAccountDTO, SummonerV4DTO {}

// Importujemy MatchDetailsType tylko jako typ referencyjny, 
// ale w praktyce często lepiej trzymać tutaj 'any' lub importować z ../match
// aby uniknąć cyklicznych zależności, jeśli Match też importuje Summonera.


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