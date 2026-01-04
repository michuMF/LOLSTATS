export const fetchMatchHistory = async (puuid: string, apiKey: string) => {
  const response = await fetch(
    `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=2&api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch match history");
  }

  return await response.json();
};