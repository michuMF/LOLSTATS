// src/api/fetchSummonerDetails.ts
import { SummonerV4Schema, type SummonerV4DTO } from "../types/summoner";

export const fetchSummonerDetails = async (puuid: string, region: string): Promise<SummonerV4DTO> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/api/summoner/${region}/${puuid}`);
  
  if (!response.ok) throw new Error("Failed to fetch summoner details");
  const rawData = await response.json();

  const result = SummonerV4Schema.safeParse(rawData);

  if (!result.success) {
    console.error("❌ ZOD ERROR (Summoner):", result.error.format());
    return rawData as SummonerV4DTO; // Fallback
  }

  return result.data;
};