import { z } from "zod";

// --- POPRAWIONY SCHEMAT ---
// Zmieniliśmy id i accountId na .optional(), bo Twoje API ich nie zwraca.
const SummonerSchema = z.object({
  puuid: z.string(),
  profileIconId: z.number(),
  revisionDate: z.number(),
  summonerLevel: z.number(),
});

export type SummonerV4DTO = z.infer<typeof SummonerSchema>;

export const fetchSummonerDetails = async (puuid: string, region: string): Promise<SummonerV4DTO> => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const response = await fetch(`${apiUrl}/api/summoner/${region}/${puuid}`);
  if (!response.ok) throw new Error("Failed to fetch summoner details");
  
  const rawData = await response.json();

  // DEBUG: Zobaczmy w konsoli co parsowany, jeśli znowu coś pójdzie nie tak
  console.log("📥 Summoner Data received:", rawData);

  // Bezpieczne parsowanie
  const result = SummonerSchema.safeParse(rawData);
  console.log(result);
  

  if (!result.success) {
    console.error("❌ ZOD ERROR (Summoner):", result.error.format());
    // Fallback - zwracamy surowe dane, żeby aplikacja nie padła
    return rawData as SummonerV4DTO;
  }

  return result.data;
};