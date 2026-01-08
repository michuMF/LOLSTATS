import { useQuery } from '@tanstack/react-query';
import { fetchSummonerDetails } from '../api/fetchSummonerDetails';
import { fetchRankedData } from '../api/fetchRankedData';
import { fetchMatchHistory } from '../api/fetchMatchHistory';
import { fetchMatchDetails } from '../api/fetchMatchDetails';

export const useSummonerData = (gameName: string, tagLine: string, region: string) => {
  
  // 1. ACCOUNT (Zwraca PUUID)
  const accountQuery = useQuery({
    queryKey: ['account', region, gameName, tagLine],
    queryFn: async () => {
      if (!gameName || !tagLine) return null;
      const response = await fetch(`http://localhost:4000/api/account/${region}/${gameName}/${tagLine}`);
      if (!response.ok) throw new Error('Account not found');
      return response.json();
    },
    enabled: !!gameName && !!tagLine && !!region,
    retry: 1
  });

  const puuid = accountQuery.data?.puuid;

  // 2. SUMMONER DETAILS (Nadal potrzebne do ikony i levela)
  const summonerQuery = useQuery({
    queryKey: ['summoner', region, puuid],
    queryFn: () => fetchSummonerDetails(puuid, region),
    enabled: !!puuid, 
  });

  // 3. RANKED DATA (Teraz korzysta z PUUID!)
  const rankedQuery = useQuery({
    queryKey: ['ranked', region, puuid], // Klucz zależy teraz od PUUID
    queryFn: () => fetchRankedData(puuid, region),
    enabled: !!puuid, // Startuje od razu, gdy mamy PUUID (nie czeka na summonerId)
  });

  
  
  // 4. MATCHES
  const matchesQuery = useQuery({
    queryKey: ['matches', region, puuid],
    queryFn: async () => {
      const matchIds = await fetchMatchHistory(puuid, region);
      const detailsPromises = matchIds.slice(0, 10).map((id: string) => 
        fetchMatchDetails(id, region)
      );
      return Promise.all(detailsPromises);
    },
    enabled: !!puuid,
  });

  return {
    account: accountQuery,
    summoner: summonerQuery,
    ranked: rankedQuery,
    matches: matchesQuery,
    isLoading: accountQuery.isLoading || summonerQuery.isLoading,
    error: accountQuery.error || summonerQuery.error
  };
};