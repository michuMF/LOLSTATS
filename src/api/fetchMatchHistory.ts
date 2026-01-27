import { z } from "zod";

const MatchHistorySchema = z.array(z.string());

export const fetchMatchHistory = async (puuid: string, region: string): Promise<string[]> => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const response = await fetch(`${apiUrl}/api/matches/ids/${region}/${puuid}`);
  if (!response.ok) throw new Error("Failed to fetch match history");

  const rawData = await response.json();

  const result = MatchHistorySchema.safeParse(rawData);

  if (!result.success) {
    console.error("❌ ZOD ERROR (Match History):", result.error.format());
    // Jeśli to nie tablica stringów, to mamy problem, ale spróbujmy zwrócić
    return Array.isArray(rawData) ? rawData : [];
  }

  return result.data;
};
