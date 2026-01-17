import type { Objectives } from "./Objectives";



export interface Ban {
  championId: number;
  pickTurn: number;
}

export interface Team {
  bans?: Ban[];           // Opcjonalne
  objectives?: Objectives; // Opcjonalne
  teamId: number;
  win: boolean;
}