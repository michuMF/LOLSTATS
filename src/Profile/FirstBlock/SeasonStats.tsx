interface SeasonStatsProps {
  wins: number;
  losses: number;
  winRate: number;
  totalGames: number;
  isPlacementStats: boolean;
  hasRankedData: boolean; // czy w ogóle mamy dane (activeRank lub mecze)
  seasonPrefix: string;
}

export const SeasonStats = ({
  wins,
  losses,
  winRate,
  totalGames,
  isPlacementStats,
  hasRankedData,
  seasonPrefix,
}: SeasonStatsProps) => {
  if (!hasRankedData) {
    return (
      <div className="flex flex-col items-center justify-center w-1/3 border-l border-r border-slate-100 px-4">
        <span className="text-slate-300 font-medium italic">No ranked stats yet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-1/3 border-l border-r border-slate-100 px-4">
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          {isPlacementStats ? "Placement Games" : `Season ${seasonPrefix} Performance`}
        </span>
      </div>

      <div className="flex items-end gap-1 mb-1">
        <span className="text-3xl font-black text-slate-700">{winRate}%</span>
        <span className="text-xs font-bold text-slate-400 mb-1.5">Win Rate</span>
      </div>

      {/* Pasek Winrate */}
      <div className="w-full max-w-[120px] h-2 bg-slate-100 rounded-full overflow-hidden flex mb-1">
        <div
          className={`${winRate >= 50 ? "bg-green-500" : "bg-orange-400"} h-full transition-all duration-500`}
          style={{ width: `${winRate}%` }}
        ></div>
      </div>

      <div className="text-xs font-semibold text-slate-500">
        <span className="text-green-600">{wins}W</span>
        <span className="mx-1">-</span>
        <span className="text-red-500">{losses}L</span>
        <span className="text-slate-300 mx-1">|</span>
        <span>{totalGames} Games</span>
      </div>
    </div>
  );
};
