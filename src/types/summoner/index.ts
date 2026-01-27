// src/types/summoner/index.ts
import { z } from "zod";
import type { MatchDetailsType } from "../../api/fetchMatchDetails";

// --- 1. Definicja Schematów Zod (Single Source of Truth) ---

export const RiotAccountSchema = z.object({
  puuid: z.string(),
  gameName: z.string(),
  tagLine: z.string(),
});

// Zaktualizowany schemat wg Twojego api/fetchSummonerDetails.ts
export const SummonerV4Schema = z.object({
  puuid: z.string(),
  profileIconId: z.number(),
  revisionDate: z.number(),
  summonerLevel: z.number(),
});

export const RankedDataSchema = z.object({
  leagueId: z.string(),
  queueType: z.string(),
  tier: z.string(),
  rank: z.string(),
  leaguePoints: z.number(),
  wins: z.number(),
  losses: z.number(),
  veteran: z.boolean(),
  inactive: z.boolean(),
  freshBlood: z.boolean(),
  hotStreak: z.boolean(),
});

// --- 2. Inferencja Typów ---

export type RiotAccountDTO = z.infer<typeof RiotAccountSchema>;
export type SummonerV4DTO = z.infer<typeof SummonerV4Schema>;
export type RankedDataType = z.infer<typeof RankedDataSchema>;

// Łączenie typów (Intersection)
export type SummonerProfileInfoType = RiotAccountDTO & SummonerV4DTO;

// --- 3. Złożone typy aplikacji (te, których nie dostajesz bezpośrednio z jednego endpointu) ---

export interface SummonerDataType extends SummonerProfileInfoType {
  rankedData?: RankedDataType[];
  matchHistory?: string[];
  matchDetails?: MatchDetailsType[];
}
