export const fetchLiveGame = async (puuid: string, region: string) => {
  const response = await fetch(`http://localhost:4000/api/spectator/${region}/${puuid}`);
  if (!response.ok) {
    if (response.status === 404) return null; // Gracz nie jest w grze
    throw new Error('Błąd pobierania gry live');
  }
  return response.json();
};