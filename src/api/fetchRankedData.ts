import type { RankedData } from "../types/types";

export const fetchRankedData = async (
  puuid: string,
  apiKey: string
): Promise<RankedData[]> => {
  const response = await fetch(
    `https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch ranked data");
  }

  return await response.json();
};