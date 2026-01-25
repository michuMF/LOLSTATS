import { useQuery } from "@tanstack/react-query";
import { fetchRankedData } from "../api/fetchRankedData";


export const useRankedData = (puuid: string | undefined, region: string | undefined) => {
  return useQuery({
    queryKey: ["ranked", region, puuid], 
    queryFn: () => fetchRankedData(puuid!, region!),
    enabled: !!puuid && !!region,
    staleTime: 1000 * 60 * 5, 
    retry: 1,
  });
};