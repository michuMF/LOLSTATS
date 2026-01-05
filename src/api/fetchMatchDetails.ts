import type { MatchDetailsType } from "../types/types";


export const fetchMatchDetails = async (matchId: string): Promise<MatchDetailsType> => {
  const response = await fetch(`http://localhost:4000/api/matches/details/${matchId}`);
  if (!response.ok) throw new Error("Failed to fetch match details");
  return response.json();
};