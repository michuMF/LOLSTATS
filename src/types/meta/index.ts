import { z } from "zod";

export const ItemStatSchema = z.object({
  picks: z.number(),
  wins: z.number(),
});

export const ChampionMetaSchema = z.object({
  matchesAnalyzed: z.number(),
  
  items: z.record(z.string(), ItemStatSchema), // Key: ItemID, Value: Stats
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