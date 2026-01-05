export const fetchMatchHistory = async (puuid: string): Promise<string[]> => {
  const response = await fetch(`http://localhost:4000/api/matches/ids/${puuid}`);
  if (!response.ok) throw new Error("Failed to fetch match history");
  return response.json();
};