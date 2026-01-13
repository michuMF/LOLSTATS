import type { RankedDataType, SummonerProfileInfoType, MatchDetailsType } from "../types/types";

// Importujemy nasze nowe komponenty
import { PlayerIdentity } from "./PlayerIdentity";
import { SeasonStats } from "./SeasonStats";
import { RankDisplay } from "./RankDisplay";

// Konfiguracja Sezonu
const CURRENT_SEASON_PREFIX = "16"; 

interface PlayerMainPanelProps {
  summoner: SummonerProfileInfoType;
  ranked: RankedDataType[] | undefined;
  matches?: MatchDetailsType[];
}

export const PlayerMainPanel = ({ summoner, ranked, matches }: PlayerMainPanelProps) => {

  // --- LOGIKA OBLICZENIOWA ---
  
  const soloRank = ranked?.find((r) => r.queueType === "RANKED_SOLO_5x5");
  const activeRank = soloRank || ranked?.find((r) => r.queueType === "RANKED_FLEX_SR");

  let wins = 0;
  let losses = 0;
  let isPlacementStats = false;

  if (activeRank) {
    // 1. Mamy rangę -> dane z API ligowego
    wins = activeRank.wins;
    losses = activeRank.losses;
  } else if (matches) {
    // 2. Brak rangi -> obliczamy z historii dla Sezonu 16
    isPlacementStats = true;
    
    const rankedMatches = matches.filter(m => {
        const isRankedQueue = m.info.queueId === 420 || m.info.queueId === 440;
        const isCurrentSeason = m.info.gameVersion.startsWith(CURRENT_SEASON_PREFIX + ".");
        return isRankedQueue && isCurrentSeason;
    });

    rankedMatches.forEach(game => {
        const participant = game.info.participants.find(p => p.puuid === summoner.puuid);
        if (participant) {
            if (participant.win) wins++;
            else losses++;
        }
    });
  }

  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const hasRankedData = !!activeRank || totalGames > 0;

  // --- WIDOK ---

  return (
    <div className="w-full flex flex-row items-center justify-between p-6 bg-white rounded-xl shadow-md border border-slate-200">
      
      {/* 1. Tożsamość Gracza */}
      <PlayerIdentity summoner={summoner} />

      {/* 2. Statystyki Sezonu */}
      <SeasonStats 
        wins={wins}
        losses={losses}
        winRate={winRate}
        totalGames={totalGames}
        isPlacementStats={isPlacementStats}
        hasRankedData={hasRankedData}
        seasonPrefix={CURRENT_SEASON_PREFIX}
      />

      {/* 3. Ranga */}
      <RankDisplay 
        activeRank={activeRank} 
        totalGames={totalGames} 
      />
      
    </div>
  );
};