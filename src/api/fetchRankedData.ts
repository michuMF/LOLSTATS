import type { RankedDataType } from "../types/types";

export const fetchRankedData = async (summonerId: string, region: string): Promise<RankedDataType[]> => {
  const response = await fetch(`http://localhost:4000/api/ranked/${region}/${summonerId}`);
  if (!response.ok) throw new Error("Failed to fetch ranked data");
  return response.json();
};