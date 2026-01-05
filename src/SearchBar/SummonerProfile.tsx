
import { useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";
import { SummonerDetails } from "./SummonerDetails";
import { RankedData } from "./RankedData";
import { MatchHistory } from "./MatchHistory";
import { fetchSummonerDetails } from "../api/fetchSummonerDetails";
import { fetchRankedData } from "../api/fetchRankedData";
import { fetchMatchHistory } from "../api/fetchMatchHistory";
import { fetchMatchDetails } from "../api/fetchMatchDetails";
import type { MatchDetailsType, SummonerBasicInfoType,SummonerDataType, } from "../types/types";








export const SummonerProfile = () => {
  
  
  const [summonerData, setSummonerData] = useState<{
    puuid: string;
    gameName: string;
    tagLine: string;
    summonerLevel?: number;
    profileIconId?: number;
    rankedData?: {
      leagueId: string;
      queueType: string;
      tier: string;
      rank: string;
      leaguePoints: number;
      wins: number;
      losses: number;
      veteran: boolean;
      inactive: boolean;
      freshBlood: boolean;
      hotStreak: boolean;
    }[];
    matchHistory?: string[]; // Lista ID meczów
    matchDetails?: MatchDetailsType[]; // Szczegóły każdego meczu
  } | null>(null);

  const handleSummonerData = async (data: SummonerBasicInfoType
  ) => {
    try {
      const API_KEY = import.meta.env.VITE_REACT_APP_RIOT_API_KEY;

      const additionalData = await fetchSummonerDetails(data.puuid, API_KEY);
      
      
      const rankedData = await fetchRankedData(data.puuid, API_KEY);
      
      
      const matchHistory = await fetchMatchHistory(data.puuid, API_KEY);

      
      

      const matchDetails = await Promise.allSettled(
        matchHistory.map((matchId: string) => fetchMatchDetails(matchId, API_KEY))
      );
      console.log(matchDetails);
      
      const validMatchDetails = matchDetails
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<MatchDetailsType>).value);


        console.log("Valid Match Details:", validMatchDetails[0].info);
      const allData: SummonerDataType = {
        ...data,
        summonerLevel: additionalData.summonerLevel,
        profileIconId: additionalData.profileIconId,
        rankedData: rankedData,
        matchHistory: matchHistory,
        matchDetails: validMatchDetails,
      };

      console.log(allData);
      
      
      
      setSummonerData(allData);
      
    } catch (error) {
      console.error("Error fetching summoner data:", error);
    }
  };
  return (
    <div>
      <SearchBar onFetchSuccess={handleSummonerData} />
      
      {/* 3. Renderujemy warunkowo, jeśli mamy dane */}
      {summonerData && (
        <div className="mt-4 p-4 border border-gray-300 rounded">
          <SummonerDetails summonerData={summonerData} />
          
          {summonerData.rankedData && (
            <RankedData rankedData={summonerData.rankedData} />
          )}
          
          {summonerData.matchHistory && (
             <MatchHistory 
              matchDetails={summonerData.matchDetails} 
              puuid={summonerData.puuid} // <--- Dodaliśmy tę linię
            />
          )}
        </div>
      )}
    </div>
  );
};