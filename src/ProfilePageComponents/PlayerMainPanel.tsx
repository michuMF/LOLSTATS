import type { RankedDataType, SummonerProfileInfoType } from "../types/types";

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


export const PlayerMainPanel = ({summoner,ranked}: {summoner: SummonerProfileInfoType, ranked: RankedDataType[] | undefined}) => {
  console.log(summoner);
  
   const soloRank = ranked?.find((r) => r.queueType === "RANKED_SOLO_5x5");
  const activeRank = soloRank || ranked?.find((r) => r.queueType === "RANKED_FLEX_SR");

  // Obliczenia do środkowej sekcji
  const totalGames = activeRank ? activeRank.wins + activeRank.losses : 0;
  const winRate = totalGames > 0 ? Math.round((activeRank!.wins / totalGames) * 100) : 0;


    return (
        <div className="w-full flex flex-row items-center justify-between p-6 bg-white rounded-xl shadow-md border border-slate-200">
      
      {/* --- KOLUMNA 1: TOŻSAMOŚĆ (LEWA) --- */}
      <div className="flex items-center gap-5 w-1/3">
        <div className="relative">
          <img
            src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summoner.profileIconId}.jpg`}
            alt="Icon"
            className="w-20 h-20 rounded-2xl border-2 border-slate-200 shadow-sm object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg";
            }}
          />
          <span className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white shadow-sm">
            {summoner.summonerLevel}
          </span>
        </div>

        <div className="flex flex-col">
          {/* Wyświetlamy gameName przekazany z propsów */}
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
            {summoner.gameName}
          </h1>
          <span className="text-sm font-semibold text-slate-400">
            #{'test'}
          </span>
        </div>
      </div>

      {/* --- KOLUMNA 2: STATYSTYKI SEZONU (ŚRODEK) --- */}
      {/* To wypełnia pustą przestrzeń */}
      <div className="flex flex-col items-center justify-center w-1/3 border-l border-r border-slate-100 px-4">
        {activeRank ? (
            <>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Season Performance</span>
                <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-black text-slate-700">{winRate}%</span>
                    <span className="text-xs font-bold text-slate-400 mb-1.5">Win Rate</span>
                </div>
                
                {/* Pasek Winrate */}
                <div className="w-full max-w-[120px] h-2 bg-slate-100 rounded-full overflow-hidden flex mb-1">
                    <div className="bg-green-500 h-full" style={{ width: `${winRate}%` }}></div>
                </div>
                
                <div className="text-xs font-semibold text-slate-500">
                    <span className="text-green-600">{activeRank.wins}W</span> 
                    <span className="mx-1">-</span>
                    <span className="text-red-500">{activeRank.losses}L</span>
                    <span className="text-slate-300 mx-1">|</span>
                    <span>{totalGames} Games</span>
                </div>
            </>
        ) : (
            <span className="text-slate-300 font-medium italic">No ranked stats</span>
        )}
      </div>

      {/* --- KOLUMNA 3: RANGA (PRAWA) --- */}
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
            <span className="font-bold text-slate-500">Unranked</span>
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">?</div>
          </div>
        )}
      </div>
    </div>
    );
}