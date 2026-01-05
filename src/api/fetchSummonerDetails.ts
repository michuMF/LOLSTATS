import type { SummonerProfileInfoType } from "../types/types";


export const fetchSummonerDetails = async (puuid: string): Promise<SummonerProfileInfoType> => {
  // Nie potrzebujemy już apiKey jako argumentu ani w URL
  const response = await fetch(`http://localhost:4000/api/summoner/${puuid}`);
  if (!response.ok) throw new Error("Failed to fetch summoner details");
  return response.json();
};