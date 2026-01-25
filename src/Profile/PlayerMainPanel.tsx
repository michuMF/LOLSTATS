// src/Profile/PlayerMainPanel.tsx
import { PlayerIdentity } from "./FirstBlock/PlayerIdentity";
import { SeasonStats } from "./FirstBlock/SeasonStats";
import { RankDisplay } from "./FirstBlock/RankDisplay";
import { useSeasonStats } from "../hooks/useSeasonStats"; // Import hooka
import type { SummonerProfileInfoType, RankedDataType } from "../types/summoner";
import type { MatchDetailsType } from "../api/fetchMatchDetails";

interface PlayerMainPanelProps {
  summoner: SummonerProfileInfoType;
  ranked: RankedDataType[] | undefined;
  matches: MatchDetailsType[];
}

export const PlayerMainPanel = ({ summoner, ranked, matches }: PlayerMainPanelProps) => {
  // Cała logika zamknięta w jednej linijce
  const stats = useSeasonStats(summoner.puuid, ranked, matches);

  return (
    <div className="w-full flex flex-row items-center justify-between p-6 bg-white rounded-xl shadow-md border border-slate-200">
      <PlayerIdentity summoner={summoner} />

      <SeasonStats 
        wins={stats.wins}
        losses={stats.losses}
        winRate={stats.winRate}
        totalGames={stats.totalGames}
        isPlacementStats={stats.isPlacementStats}
        hasRankedData={stats.hasRankedData}
        seasonPrefix={stats.seasonPrefix}
      />

      <RankDisplay 
        activeRank={stats.activeRank} 
        totalGames={stats.totalGames} 
      />
    </div>
  );
};