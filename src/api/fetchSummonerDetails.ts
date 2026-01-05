import type { SummonerProfileInfoType } from "../types/types";

export const fetchSummonerDetails = async (
  puuid: string,
  apiKey: string
): Promise<SummonerProfileInfoType> => {
  const response = await fetch(
    `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch additional summoner data");
  }

  return await response.json();
};