// src/components/player-summary/RankCard.tsx
import { FaGamepad } from "react-icons/fa";
import type { RankedDataType } from "../../api/fetchRankedData"; // Dostosuj ścieżkę

// Importy obrazków (Dostosuj ścieżki jeśli przeniosłeś plik do podfolderu!)
import Iron from "../../assets/Ranked Emblems Latest/Rank=Iron.png";
import Bronze from "../../assets/Ranked Emblems Latest/Rank=Bronze.png";
import Silver from "../../assets/Ranked Emblems Latest/Rank=Silver.png";
import Gold from "../../assets/Ranked Emblems Latest/Rank=Gold.png";
import Platinum from "../../assets/Ranked Emblems Latest/Rank=Platinum.png";
import Emerald from "../../assets/Ranked Emblems Latest/Rank=Emerald.png";
import Diamond from "../../assets/Ranked Emblems Latest/Rank=Diamond.png";
import Master from "../../assets/Ranked Emblems Latest/Rank=Master.png";
import Grandmaster from "../../assets/Ranked Emblems Latest/Rank=Grandmaster.png";
import Challenger from "../../assets/Ranked Emblems Latest/Rank=Challenger.png";

const RANK_ICONS: Record<string, string> = {
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

const getColorForTier = (tier: string) => {
  switch (tier) {
    case "IRON":
      return "text-zinc-500";
    case "BRONZE":
      return "text-amber-700";
    case "SILVER":
      return "text-slate-400";
    case "GOLD":
      return "text-yellow-500";
    case "PLATINUM":
      return "text-cyan-500";
    case "EMERALD":
      return "text-emerald-500";
    case "DIAMOND":
      return "text-blue-400";
    case "MASTER":
      return "text-purple-500";
    case "GRANDMASTER":
      return "text-red-500";
    case "CHALLENGER":
      return "text-amber-300";
    default:
      return "text-slate-800";
  }
};

interface RankCardProps {
  rankData: RankedDataType | null | undefined;
}

export const RankCard = ({ rankData }: RankCardProps) => {
  if (!rankData) {
    return (
      <div className="flex flex-col items-center justify-center pl-0 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:border-none">
        <div className="text-center text-slate-400 opacity-60">
          <FaGamepad size={32} className="mx-auto mb-2" />
          <p className="text-xs font-medium">
            Brak danych rankingowych
            <br />
            dla tej kolejki
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pl-0 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:border-none">
      <div className="w-20 h-20 mb-2 transition-transform hover:scale-110 duration-300">
        <img
          src={RANK_ICONS[rankData.tier]}
          alt={rankData.tier}
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>

      <p
        className={`text-xl font-black tracking-tighter uppercase ${getColorForTier(rankData.tier)}`}
      >
        {rankData.tier} {rankData.rank}
      </p>
      <p className="text-xs text-slate-500 font-bold">{rankData.leaguePoints} LP</p>
    </div>
  );
};
