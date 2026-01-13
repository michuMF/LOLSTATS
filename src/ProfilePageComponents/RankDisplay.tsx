import type { RankedDataType } from "../types/types";

// Importy ikon rang
import Iron from "../assets/Ranked Emblems Latest/Rank=Iron.png";
import Bronze from "../assets/Ranked Emblems Latest/Rank=Bronze.png";
import Silver from "../assets/Ranked Emblems Latest/Rank=Silver.png";
import Gold from "../assets/Ranked Emblems Latest/Rank=Gold.png";
import Platinum from "../assets/Ranked Emblems Latest/Rank=Platinum.png";
import Emerald from "../assets/Ranked Emblems Latest/Rank=Emerald.png";
import Diamond from "../assets/Ranked Emblems Latest/Rank=Diamond.png";
import Master from "../assets/Ranked Emblems Latest/Rank=Master.png";
import Grandmaster from "../assets/Ranked Emblems Latest/Rank=Grandmaster.png";
import Challenger from "../assets/Ranked Emblems Latest/Rank=Challenger.png";

const rankIcons: Record<string, string> = {
  IRON: Iron,
  BRONZE: Bronze,
  SILVER: Silver,
  GOLD: Gold,
  PLATINUM: Platinum,
  EMERALD: Emerald,
  DIAMOND: Diamond,
  MASTER: Master,
  GRANDMASTER: Grandmaster,
  CHALLENGER: Challenger,
};

interface RankDisplayProps {
  activeRank: RankedDataType | undefined;
  totalGames: number; // Potrzebne, żeby wiedzieć czy pokazać "Placements in progress"
}

export const RankDisplay = ({ activeRank, totalGames }: RankDisplayProps) => {
  return (
    <div className="flex items-center justify-end gap-4 w-1/3 text-right">
      {activeRank ? (
        <>
          <div className="flex flex-col items-end">
            <p className="text-lg font-extrabold text-slate-700 leading-none">
              {activeRank.tier} {activeRank.rank}
            </p>
            <p className="text-sm font-bold text-slate-500">
              {activeRank.leaguePoints} LP
            </p>
          </div>
          <img
            src={rankIcons[activeRank.tier]}
            alt={activeRank.tier}
            className="w-16 h-16 object-contain drop-shadow-sm"
          />
        </>
      ) : (
        <div className="flex items-center gap-3 opacity-50">
          <div className="flex flex-col items-end">
            <span className="font-bold text-slate-600 text-lg">Unranked</span>
            {totalGames > 0 && (
              <span className="text-xs text-slate-400 font-semibold">Placements in progress</span>
            )}
          </div>
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 font-black text-xl border-4 border-slate-50">
            ?
          </div>
        </div>
      )}
    </div>
  );
};