import type { RankedDataType } from "../types/types";

export const fetchRankedData = async (puuid: string, region: string): Promise<RankedDataType[]> => {
  // Przekazujemy puuid do backendu
  const response = await fetch(`http://localhost:4000/api/ranked/${region}/${puuid}`);
  if (!response.ok) throw new Error("Failed to fetch ranked data");
  return response.json();
};