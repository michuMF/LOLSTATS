import type { RankedDataType, SummonerProfileInfoType, MatchDetailsType } from "../types/types";

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

// --- KONFIGURACJA SEZONU (Sezon 16, rok 2026) ---
const CURRENT_SEASON_PREFIX = "16"; 

interface PlayerMainPanelProps {
  summoner: SummonerProfileInfoType;
  ranked: RankedDataType[] | undefined;
  matches?: MatchDetailsType[];
}

export const PlayerMainPanel = ({ summoner, ranked, matches }: PlayerMainPanelProps) => {

  // 1. Próba znalezienia oficjalnej rangi
  const soloRank = ranked?.find((r) => r.queueType === "RANKED_SOLO_5x5");
  const activeRank = soloRank || ranked?.find((r) => r.queueType === "RANKED_FLEX_SR");

  // 2. Logika obliczania statystyk
  let wins = 0;
  let losses = 0;
  let isPlacementStats = false; // Flaga: czy dane pochodzą z historii (brak oficjalnej rangi)

  if (activeRank) {
    // A. Mamy rangę - bierzemy oficjalne dane od Riotu
    wins = activeRank.wins;
    losses = activeRank.losses;
  } else if (matches) {
    // B. Brak rangi (Placementy) - liczymy na piechotę z historii
    isPlacementStats = true;
    
    // Filtrujemy mecze:
    // 1. Tylko Ranked Solo (420) lub Flex (440)
    // 2. Tylko z obecnego sezonu (zaczynające się od "16.")
    const rankedMatches = matches.filter(m => {
        const isRankedQueue = m.info.queueId === 420 || m.info.queueId === 440;
        const isCurrentSeason = m.info.gameVersion.startsWith(CURRENT_SEASON_PREFIX + ".");
        return isRankedQueue && isCurrentSeason;
    });

    rankedMatches.forEach(game => {
        // Szukamy naszego gracza w meczu po PUUID
        const participant = game.info.participants.find(p => p.puuid === summoner.puuid);
        if (participant) {
            if (participant.win) wins++;
            else losses++;
        }
    });
  }

  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

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
              (e.target as HTMLImageElement).src =
                "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg";
            }}
          />
          <span className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white shadow-sm">
            {summoner.summonerLevel}
          </span>
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
            {summoner.gameName}
          </h1>
          <span className="text-sm font-semibold text-slate-400">
            #{summoner.tagLine}
          </span>
        </div>
      </div>

      {/* --- KOLUMNA 2: STATYSTYKI SEZONU (ŚRODEK) --- */}
      <div className="flex flex-col items-center justify-center w-1/3 border-l border-r border-slate-100 px-4">
        {(activeRank || totalGames > 0) ? (
          <>
            <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {isPlacementStats ? "Placement Games" : "Season 16 Performance"}
                </span>
                {isPlacementStats && (
                     <span className="text-[10px] text-blue-500 font-bold mb-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        (Calculated from history)
                     </span>
                )}
            </div>

            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-black text-slate-700">{winRate}%</span>
              <span className="text-xs font-bold text-slate-400 mb-1.5">Win Rate</span>
            </div>

            {/* Pasek Winrate */}
            <div className="w-full max-w-[120px] h-2 bg-slate-100 rounded-full overflow-hidden flex mb-1">
              <div
                className={`${winRate >= 50 ? 'bg-green-500' : 'bg-orange-400'} h-full transition-all duration-500`}
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
          </>
        ) : (
          <span className="text-slate-300 font-medium italic">No ranked stats yet</span>
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
            <div className="flex flex-col items-end">
                <span className="font-bold text-slate-600 text-lg">Unranked</span>
                {totalGames > 0 && <span className="text-xs text-slate-400 font-semibold">Placements in progress</span>}
            </div>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 font-black text-xl border-4 border-slate-50">
              ?
            </div>
          </div>
        )}
      </div>
    </div>
  );
};