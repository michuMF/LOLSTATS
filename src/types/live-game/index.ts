// src/types/live-game/index.ts
import { z } from "zod";

import { RankedDataSchema } from "../summoner";

// --- Schematy Pomocnicze ---

// Perki mogą w ogóle nie istnieć (dla botów)
export const PerksSchema = z
  .object({
    perkIds: z.array(z.number()).optional(),
    perkStyle: z.number().optional(),
    perkSubStyle: z.number().optional(),
  })
  .optional()
  .nullable(); // .nullable() ważne, bo API czasem zwraca null

export const LiveParticipantSchema = z
  .object({
    teamId: z.number(),
    spell1Id: z.number().optional().default(0),
    spell2Id: z.number().optional().default(0),
    championId: z.number(),
    profileIconId: z.number().optional().default(29),
    summonerName: z.string().optional(),
    riotId: z.string().optional(),
    puuid: z.string().optional(),
    summonerId: z.string().optional(), // <--- DODAJEMY TO (Ważne!)
    bot: z.boolean().optional().default(false),
    perks: PerksSchema,
  })
  .passthrough();

export const BannedChampionSchema = z.object({
  championId: z.number(),
  teamId: z.number(),
  pickTurn: z.number(),
});

export const LiveGameInfoSchema = z
  .object({
    gameId: z.number(),
    mapId: z.number(),
    gameMode: z.string(),
    gameType: z.string(),
    gameQueueConfigId: z.number().optional().nullable(),
    participants: z.array(LiveParticipantSchema),
    bannedChampions: z.array(BannedChampionSchema).default([]),
    gameStartTime: z.number().default(0),
    gameLength: z.number().default(0),
  })
  .passthrough();

export type LiveGameDTO = z.infer<typeof LiveGameInfoSchema>;
export type LiveParticipantDTO = z.infer<typeof LiveParticipantSchema>;
export type ParticipantsRanksMap = Record<string, z.infer<typeof RankedDataSchema>[]>;
