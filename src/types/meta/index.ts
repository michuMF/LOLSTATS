import { z } from "zod";

export const ItemStatSchema = z.object({
  picks: z.number(),
  wins: z.number(),
});

export const MarketingStatSchema = z.object({
  picks: z.number(),
  wins: z.number(),
});

export const RoleStatsSchema = z.object({
  matchesAnalyzed: z.number().optional(), // Deprecated (V1)
  matches: z.number().optional(), // V2
  wins: z.number().optional(), // V2

  items: z.record(z.string(), ItemStatSchema), // Key: ItemID, Value: Stats
  marketing: z
    .object({
      keystones: z.record(z.string(), MarketingStatSchema),
      secondaryTrees: z.record(z.string(), MarketingStatSchema),
      spells: z.record(z.string(), MarketingStatSchema),
    })
    .optional(),
});

// Mapa ról dla postaci: { "TOP": RoleStats, "JUNGLE": RoleStats }
export const ChampionDataSchema = z.record(z.string(), RoleStatsSchema);

// Np. "CHALLENGER": { "Aatrox": { "TOP": ... } }
export const TierDataSchema = z.record(z.string(), ChampionDataSchema);

// Cała baza: { "CHALLENGER": ..., "DIAMOND": ... }
export const MetaDatabaseSchema = z.record(z.string(), TierDataSchema);

export type MetaDatabase = z.infer<typeof MetaDatabaseSchema>;
export type RoleStats = z.infer<typeof RoleStatsSchema>;
export type ChampionData = z.infer<typeof ChampionDataSchema>;

// Alias dla kompatybilności wstecznej (w miejscach gdzie używamy pojedynczego obiektu statystyk)
export type ChampionMeta = RoleStats;

export interface ChampionBase {
  id: string;
  key: string;
  name: string;
  title: string;
}
