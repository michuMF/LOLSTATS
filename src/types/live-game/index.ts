 // Reużywamy typu Run z folderu match

import type { PerksType } from "../match";



export interface BannedChampion {
  championId: number;
  teamId: number;
  pickTurn: number;
}

export interface Observer {
  encryptionKey: string;
}

export interface CurrentGameParticipant {
  championId: number;
  perks: PerksType; 
  profileIconId: number;
  bot: boolean;
  teamId: number;
  summonerName: string;
  summonerId: string;
  spell1Id: number;
  spell2Id: number;
  riotId: string; 
  gameCustomizationObjects: any[]; 
}

export interface LiveGameDTO {
  gameId: number;
  mapId: number;
  gameMode: string;
  gameType: string;
  gameQueueConfigId?: number;
  participants: CurrentGameParticipant[];
  observers: Observer;
  platformId: string;
  bannedChampions: BannedChampion[];
  gameStartTime: number;
  gameLength: number;
}