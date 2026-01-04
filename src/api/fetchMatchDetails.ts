export const fetchMatchDetails = async (matchId: string, apiKey: string) => {
  const response = await fetch(
    `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch details for match ${matchId}`);
  }

  return await response.json();
};