import { z } from "zod";

// 1. Schemat pojedynczego wpisu rankingowego
const RankedEntrySchema = z.object({
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

// 2. Schemat odpowiedzi (Tablica wpisów)
const RankedDataArraySchema = z.array(RankedEntrySchema);

// 3. Generujemy typ (opcjonalnie, jeśli potrzebujesz go importować gdzie indziej)
export type RankedDataType = z.infer<typeof RankedEntrySchema>;

export const fetchRankedData = async (puuid: string, region: string): Promise<RankedDataType[]> => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const response = await fetch(`${apiUrl}/api/ranked/${region}/${puuid}`);

  console.log(response);
  
  if (!response.ok) throw new Error("Failed to fetch ranked data");

  
  
  const rawData = await response.json();
  
  const result = RankedDataArraySchema.safeParse(rawData);
  console.log("📥 Summoner Data received:", rawData);

  // 4. Walidacja
  if (!result.success) {
      console.error("❌ ZOD ERROR (Summoner):", result.error.format());
      // Fallback - zwracamy surowe dane, żeby aplikacja nie padła
      return rawData as RankedDataType[];
    }
  
    return result.data;
};