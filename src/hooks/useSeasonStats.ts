import { useMemo } from "react";
import type { RankedDataType } from "../types/summoner";
import type { MatchDetailsType } from "../api/fetchMatchDetails";

const CURRENT_SEASON_PREFIX = "16";

export const useSeasonStats = (
  summonerPuuid: string,
  rankedData: RankedDataType[] | undefined,
  matches: MatchDetailsType[]
) => {
  return useMemo(() => {
    const soloRank = rankedData?.find((r) => r.queueType === "RANKED_SOLO_5x5");
    const activeRank = soloRank || rankedData?.find((r) => r.queueType === "RANKED_FLEX_SR");

    let wins = 0;
    let losses = 0;
    let isPlacementStats = false;

    if (activeRank) {
      // Dane z API ligowego
      wins = activeRank.wins;
      losses = activeRank.losses;
    } else if (matches && matches.length > 0) {
      // Obliczanie z historii (Placement/Unranked)
      isPlacementStats = true;

      const rankedMatches = matches.filter((m) => {
        const isRankedQueue = m.info.queueId === 420 || m.info.queueId === 440;
        const isCurrentSeason = m.info.gameVersion?.startsWith(CURRENT_SEASON_PREFIX + ".");
        return isRankedQueue && isCurrentSeason;
      });

      rankedMatches.forEach((game) => {
        const participant = game.info.participants.find((p) => p.puuid === summonerPuuid);
        if (participant) {
          if (participant.win) {
            wins++;
          } else {
            losses++;
          }
        }
      });
    }

    const totalGames = wins + losses;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    const hasRankedData = !!activeRank || totalGames > 0;

    return {
      activeRank,
      wins,
      losses,
      totalGames,
      winRate,
      isPlacementStats,
      hasRankedData,
      seasonPrefix: CURRENT_SEASON_PREFIX,
    };
  }, [summonerPuuid, rankedData, matches]);
};
