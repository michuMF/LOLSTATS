import { z } from "zod";

// --- SCHEMATY (Bez zmian, są super) ---
export const RankedEntrySchema = z.object({
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

export const RankedDataArraySchema = z.array(RankedEntrySchema);
export type RankedDataType = z.infer<typeof RankedEntrySchema>;

// --- FETCHER ---
// To jest czysta funkcja JS/TS. Nie używa hooków.
export const fetchRankedData = async (puuid: string, region: string): Promise<RankedDataType[]> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const response = await fetch(`${apiUrl}/api/ranked/${region}/${puuid}`);
  if (!response.ok) throw new Error("Failed to fetch ranked data");

  const rawData = await response.json();
  
  // Walidacja Zod
  const result = RankedDataArraySchema.safeParse(rawData);
  
  if (!result.success) {
      console.error("❌ ZOD ERROR (Ranked):", result.error.format());
      return rawData as RankedDataType[]; // Fallback
  }
  
  return result.data;
};