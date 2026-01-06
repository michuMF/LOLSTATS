import type { SummonerProfileInfoType } from "../types/types";

export const fetchSummonerDetails = async (puuid: string, region: string): Promise<SummonerProfileInfoType> => {
  const response = await fetch(`http://localhost:4000/api/summoner/${region}/${puuid}`);
  if (!response.ok) throw new Error("Failed to fetch summoner details");
  return response.json();
};