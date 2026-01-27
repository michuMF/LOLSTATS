// src/types/otp-types.ts

export interface OtpPlayer {
  name: string;
  rank: string;
  position: string;
  win: boolean;
}

export interface OtpBuild {
  items: number[];
  spells: number[];
  // Możesz dodać runy, jeśli będziesz ich potrzebować
  runes?: {
    primaryStyle: number;
    subStyle: number;
  };
}

export interface OtpChampionData {
  meta: {
    matchId: string;
    championId: number;
    patch: string;
    tier: string;
  };
  player: OtpPlayer;
  build: OtpBuild;
  // Dodajemy performance opcjonalnie, jeśli chciałbyś pokazać KDA
  performance?: {
    kda: string;
    win?: boolean;
  };
}

// Główny typ słownika danych (kluczem jest ChampionID jako string)
export type OtpDataset = Record<string, OtpChampionData>;
