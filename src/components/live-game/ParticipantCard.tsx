import { memo } from "react";
import { Link } from "react-router-dom";
import { useRankedData } from "../../hooks/useRankedData"; // <--- Importujemy nasz nowy hook
import type { LiveParticipantDTO } from "../../types/live-game";

interface ParticipantCardProps {
  participant: LiveParticipantDTO;
  isBlueTeam: boolean;
  region: string;
  championName: string;
  getSpellId: (id: number) => string | null;
  getRuneIcon: (id: number) => string | null;
  version: string;
}

const ParticipantCardComponent = ({
  participant,
  isBlueTeam,
  region,
  championName,
  getSpellId,
  getRuneIcon,
  version,
}: ParticipantCardProps) => {
  // --- 1. UŻYCIE HOOKA ---
  // Pobieramy rangę TYLKO dla tego jednego gracza
  const { data: rankData, isLoading: isRankLoading } = useRankedData(participant.puuid, region);

  // --- 2. LOGIKA WYŚWIETLANIA RANGI ---
  const soloRank = rankData?.find((r) => r.queueType === "RANKED_SOLO_5x5");
  const flexRank = rankData?.find((r) => r.queueType === "RANKED_FLEX_SR");
  const bestRank = soloRank || flexRank;

  let winRateString = "Unranked";
  let winRateColor = "text-slate-500";
  let totalGames = 0;

  if (bestRank) {
    totalGames = bestRank.wins + bestRank.losses;
    const wr = totalGames > 0 ? Math.round((bestRank.wins / totalGames) * 100) : 0;
    winRateString = `${wr}% WR`;

    // Kolorowanie WR
    if (wr >= 60) winRateColor = "text-yellow-600 font-bold";
    else if (wr >= 50) winRateColor = "text-green-600 font-bold";
    else if (wr < 45 && totalGames > 10) winRateColor = "text-red-500 font-bold";
  }

  // --- 3. RESZTA UI ---
  const teamColorClass = isBlueTeam
    ? "border-l-4 border-blue-500 bg-blue-50/50"
    : "border-r-4 border-red-500 bg-red-50/50";
  const displayName = participant.riotId || participant.summonerName || "Bot";
  const isBot = !participant.puuid;

  // Spelle i Runy
  const spell1 = getSpellId(participant.spell1Id);
  const spell2 = getSpellId(participant.spell2Id);
  const keystoneIcon = participant.perks?.perkIds?.[0]
    ? getRuneIcon(participant.perks.perkIds[0])
    : null;
  const subStyleIcon = participant.perks?.perkSubStyle
    ? getRuneIcon(participant.perks.perkSubStyle)
    : null;

  return (
    <div
      className={`relative flex items-center justify-between p-3 mb-2 rounded shadow-sm bg-white ${teamColorClass} transition hover:scale-[1.01]`}
    >
      {/* LEWA STRONA (Champion, Spells, Runes) */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
            }}
            alt={championName}
            loading="lazy"
            className="w-12 h-12 rounded-full border-2 border-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            {spell1 && (
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell1}.png`}
                className="w-5 h-5 rounded"
                alt="Spell1"
                loading="lazy"
              />
            )}
            {spell2 && (
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell2}.png`}
                className="w-5 h-5 rounded"
                alt="Spell2"
                loading="lazy"
              />
            )}
          </div>
          <div className="flex gap-1 justify-center items-center">
            {keystoneIcon && (
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/img/${keystoneIcon}`}
                className="w-5 h-5 bg-slate-800 rounded-full p-0.5"
                alt="Key"
                loading="lazy"
              />
            )}
            {subStyleIcon && (
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/img/${subStyleIcon}`}
                className="w-5 h-5 bg-slate-800 rounded-full p-1 opacity-90"
                alt="Sub"
                loading="lazy"
              />
            )}
          </div>
        </div>
      </div>

      {/* ŚRODEK (Nick) */}
      <div className={`flex-1 px-4 ${isBlueTeam ? "text-left" : "text-right"}`}>
        {isBot ? (
          <span className="font-bold text-slate-500">{displayName}</span>
        ) : (
          <Link
            to={`/profile/${region}/${displayName.replace("#", "/")}`}
            className="font-bold text-slate-700 hover:text-blue-600 block truncate"
          >
            {displayName}
          </Link>
        )}
        <div className="text-xs text-slate-400 font-mono mt-0.5">{championName}</div>
      </div>

      {/* PRAWA STRONA (Ranga z Hooka) */}
      <div className="w-32 flex flex-col items-end justify-center text-right border-l border-slate-100 pl-3">
        {isRankLoading ? (
          // Skeleton Loading
          <div className="animate-pulse space-y-1 opacity-50">
            <div className="h-3 w-16 bg-slate-300 rounded"></div>
            <div className="h-2 w-10 bg-slate-200 rounded ml-auto"></div>
          </div>
        ) : bestRank ? (
          <>
            <div className="font-bold text-slate-700 text-sm whitespace-nowrap">
              {bestRank.tier} {bestRank.rank}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
              {bestRank.leaguePoints} LP <span className="mx-1">•</span>
              <span className={winRateColor}>{winRateString}</span>
            </div>
            <div className="text-[10px] text-slate-400">{totalGames} games</div>
          </>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Unranked</span>
        )}
      </div>
    </div>
  );
};

// Wrap with memo to prevent unnecessary re-renders
export const ParticipantCard = memo(ParticipantCardComponent);
