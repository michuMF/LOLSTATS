import { z } from "zod";

export const ItemStatSchema = z.object({
  picks: z.number(),
  wins: z.number(),
});

export const MarketingStatSchema = z.object({
  picks: z.number(),
  wins: z.number(),
});

export const ChampionMetaSchema = z.object({
  matchesAnalyzed: z.number().optional(), // Deprecated (V1)
  matches: z.number().optional(), // V2
  wins: z.number().optional(), // V2

  items: z.record(z.string(), ItemStatSchema), // Key: ItemID, Value: Stats
  marketing: z.object({
    keystones: z.record(z.string(), MarketingStatSchema),
    secondaryTrees: z.record(z.string(), MarketingStatSchema),
    spells: z.record(z.string(), MarketingStatSchema),
  }).optional(),
});

// Np. "CHALLENGER": { "Aatrox": { ... } }
export const TierDataSchema = z.record(z.string(), ChampionMetaSchema);

// Cała baza: { "CHALLENGER": ..., "DIAMOND": ... }
export const MetaDatabaseSchema = z.record(z.string(), TierDataSchema);

export type MetaDatabase = z.infer<typeof MetaDatabaseSchema>;
export type ChampionMeta = z.infer<typeof ChampionMetaSchema>;

export interface ChampionBase {
  id: string;
  key: string;
  name: string;
  title: string;
}