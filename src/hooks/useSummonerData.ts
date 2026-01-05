import { useQuery } from '@tanstack/react-query';
import { fetchSummonerDetails } from '../api/fetchSummonerDetails';
import { fetchRankedData } from '../api/fetchRankedData';
import { fetchMatchHistory } from '../api/fetchMatchHistory';
import { fetchMatchDetails } from '../api/fetchMatchDetails';

const API_KEY = import.meta.env.VITE_REACT_APP_RIOT_API_KEY;

export const useSummonerData = (gameName: string, tagLine: string) => {
  
  // 1. Pobierz PUUID na podstawie GameName i TagLine
  const accountQuery = useQuery({
    queryKey: ['account', gameName, tagLine],
    queryFn: async () => {
      const res = await fetch(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`
      );
      if (!res.ok) throw new Error("Nie znaleziono gracza o takim Nicku/Tagu.");
      return res.json();
    },
    enabled: !!gameName && !!tagLine, // Uruchom tylko gdy mamy parametry
  });

  const puuid = accountQuery.data?.puuid;

  // 2. Pobierz szczegóły profilu (Level, Ikona) - zależy od PUUID
  const summonerQuery = useQuery({
    queryKey: ['summoner', puuid],
    queryFn: () => fetchSummonerDetails(puuid, API_KEY),
    enabled: !!puuid, 
  });

  // 3. Pobierz rangi - zależy od PUUID
  const rankedQuery = useQuery({
    queryKey: ['ranked', puuid],
    queryFn: () => fetchRankedData(puuid, API_KEY),
    enabled: !!puuid,
  });

  // 4. Pobierz historię i detale meczów - zależy od PUUID
  const matchesQuery = useQuery({
    queryKey: ['matches', puuid],
    queryFn: async () => {
      // a) Pobierz listę ID meczów
      const matchIds = await fetchMatchHistory(puuid, API_KEY);
      
      // b) Pobierz detale dla każdego meczu (Promise.all)
      // Pobieramy 10 ostatnich meczów, żeby nie zabić limitu API
      const detailsPromises = matchIds.slice(0, 10).map((id: string) => 
        fetchMatchDetails(id, API_KEY)
      );
      
      return Promise.all(detailsPromises);
    },
    enabled: !!puuid,
  });

  return {
    account: accountQuery,
    summoner:summonerQuery,
    ranked: rankedQuery,
    matches: matchesQuery,
    // Helper: czy cokolwiek kluczowego się ładuje?
    isLoading: accountQuery.isLoading || summonerQuery.isLoading,
    // Helper: czy wystąpił błąd w głównym zapytaniu?
    error: accountQuery.error || summonerQuery.error
  };
};