import { useQuery } from '@tanstack/react-query';
import { fetchSummonerDetails } from '../api/fetchSummonerDetails';
import { fetchRankedData } from '../api/fetchRankedData';
import { fetchMatchHistory } from '../api/fetchMatchHistory';
import { fetchMatchDetails } from '../api/fetchMatchDetails';

export const useSummonerData = (gameName: string, tagLine: string, region: string) => {
  
  // 1. ACCOUNT (PUUID)
  const accountQuery = useQuery({
    queryKey: ['account', region, gameName, tagLine], // Dodano region do klucza cache
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
  const summonerId = accountQuery.data?.id; // Jeśli backend zwraca summonerId z konta, jeśli nie - pobierzemy w kroku 2

  // 2. SUMMONER DETAILS
  const summonerQuery = useQuery({
    queryKey: ['summoner', region, puuid],
    queryFn: () => fetchSummonerDetails(puuid, region),
    enabled: !!puuid, 
  });

  const activeSummonerId = summonerQuery.data?.id; // ID potrzebne do rang

  // 3. RANKED DATA
  const rankedQuery = useQuery({
    queryKey: ['ranked', region, activeSummonerId],
    queryFn: () => fetchRankedData(activeSummonerId, region),
    enabled: !!activeSummonerId,
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