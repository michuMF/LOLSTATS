// src/hooks/useSummonerData.ts
import { useQuery } from '@tanstack/react-query';
import { fetchSummonerDetails } from '../api/fetchSummonerDetails';
import { fetchMatchHistory } from '../api/fetchMatchHistory';
import { fetchMatchDetails } from '../api/fetchMatchDetails';
import type { RiotAccountDTO, SummonerProfileInfoType } from '../types';
import { useRankedData } from './useRankedData';


export const useSummonerData = (gameName: string, tagLine: string, region: string) => {

  const apiUrl = import.meta.env.VITE_API_URL
  
  // 1. ACCOUNT (Pobiera PUUID, GameName, TagLine)
  const accountQuery = useQuery<RiotAccountDTO>({
    queryKey: ['account', region, gameName, tagLine],
    queryFn: async () => {
      if (!gameName || !tagLine) return null;
      const response = await fetch(`${apiUrl}/api/account/${region}/${gameName}/${tagLine}`);
      if (!response.ok) throw new Error('Account not found');
      return response.json();
    },
    enabled: !!gameName && !!tagLine && !!region,
    retry: 1
  });

  const accountData = accountQuery.data;
  const puuid = accountData?.puuid;

  // 2. SUMMONER DETAILS (Pobiera Level i Iconę po PUUID)
  const summonerQuery = useQuery({
    queryKey: ['summoner', region, puuid],
    queryFn: () => fetchSummonerDetails(puuid!, region),
    enabled: !!puuid, 
  });

  // 3. RANKED DATA 
  const rankedQuery = useRankedData(puuid, region);
  

  
  
  // 4. MATCHES
  const matchesQuery = useQuery({
    queryKey: ['matches', region, puuid],
    queryFn: async () => {
      const matchIds = await fetchMatchHistory(puuid!, region);
      const detailsPromises = matchIds.slice(0, 10).map((id: string) => 
        fetchMatchDetails(id, region)
      );
      return Promise.all(detailsPromises);
    },
    enabled: !!puuid,
  });

  // --- TWORZENIE OBIEKTU ZBIORCZEGO ---
  // Łączymy dane z Account (name, tag) i Summoner (level, icon)
  let combinedSummonerData: SummonerProfileInfoType | null = null;

 
  
  if (accountData && summonerQuery.data) {
    combinedSummonerData = {
        ...accountData,      // gameName, tagLine, puuid
        ...summonerQuery.data // id, accountId, profileIconId, summonerLevel
    };
  }

  return {
    // Zwracamy obiekt `summoner` który udaje zapytanie react-query, 
    // ale w polu `data` ma nasze połączone dane.
    summoner: {
        data: combinedSummonerData,
        isLoading: accountQuery.isLoading || summonerQuery.isLoading,
        isError: accountQuery.isError || summonerQuery.isError,
        error: accountQuery.error || summonerQuery.error
    },
    ranked: rankedQuery,
    matches: matchesQuery,
    isLoading: accountQuery.isLoading || summonerQuery.isLoading,
    error: accountQuery.error || summonerQuery.error
  };
};