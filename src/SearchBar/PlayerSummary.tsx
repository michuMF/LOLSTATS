// src/SearchBar/PlayerSummary.tsx
import { useState, useMemo } from "react";
import type { MatchDetailsType, RankedDataType } from "../types/types";
import { FaChartPie, FaSkull, FaCrosshairs, FaGamepad } from "react-icons/fa";

// --- IMPORTY EMBLEMATÓW RANG ---
// UWAGA: Sprawdź, czy nazwy plików w folderze src/assets/ranks zgadzają się z tymi poniżej!
// Jeśli masz pliki nazwane np. "iron.png", zmień "Rank=Iron.png" na "iron.png".
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

// Mapa grafik
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

// --- KONFIGURACJA KOLEJEK ---
const QUEUE_FILTERS : Record<string, { id: number | null; label: string }> = {
  ALL: { id: null, label: "Wszystkie" },
  SOLO: { id: 420, label: "Ranked Solo" },
  FLEX: { id: 440, label: "Ranked Flex" },
  ARAM: { id: 450, label: "ARAM" },
  ARENA: { id: 1700, label: "Arena" },
};


type QueueKey = keyof typeof QUEUE_FILTERS;

interface PlayerSummaryProps {
  matches: MatchDetailsType[];
  leagueData: RankedDataType[] | null;
  puuid: string;
}

export const PlayerSummary = ({ matches, leagueData, puuid }: PlayerSummaryProps) => {
  const [activeFilter, setActiveFilter] = useState<QueueKey>("ALL");
 
  
  // --- 1. FILTROWANIE MECZÓW ---
  const filteredMatches = useMemo(() => {
    if (activeFilter === "ALL") return matches;
    return matches.filter((m) => m.info.queueId === QUEUE_FILTERS[activeFilter].id);
  }, [matches, activeFilter]);


  // --- 2. OBLICZANIE STATYSTYK ---
  const stats = useMemo(() => {
    if (!filteredMatches.length) return null;

    let wins = 0;
    let kills = 0;
    let deaths = 0;
    let assists = 0;
    let cs = 0;
    let damage = 0;
    let duration = 0;

    filteredMatches.forEach((match) => {
      const self = match.info.participants.find((p) => p.puuid === puuid);
      if (self) {
        if (self.win) wins++;
        kills += self.kills;
        deaths += self.deaths;
        assists += self.assists;
        cs += (self.totalMinionsKilled || 0) + (self.neutralMinionsKilled || 0);
        damage += self.totalDamageDealtToChampions;
      }
      duration += match.info.gameDuration;
    });

    const games = filteredMatches.length;
    return {
      games,
      wins,
      losses: games - wins,
      winrate: Math.round((wins / games) * 100),
      kda: deaths === 0 ? (kills + assists) : ((kills + assists) / deaths).toFixed(2),
      avgKills: (kills / games).toFixed(1),
      avgDeaths: (deaths / games).toFixed(1),
      avgAssists: (assists / games).toFixed(1),
      avgCs: (cs / games).toFixed(1),
      csPerMin: (cs / (duration / 60)).toFixed(1),
      avgDmg: Math.round(damage / games).toLocaleString(),
    };
  }, [filteredMatches, puuid]);

  // --- 3. POBIERANIE RANGI ---
  const currentRank = useMemo(() => {
    if (!leagueData) return null;
    if (activeFilter === "SOLO") return leagueData.find(l => l.queueType === "RANKED_SOLO_5x5");
    if (activeFilter === "FLEX") return leagueData.find(l => l.queueType === "RANKED_FLEX_SR");
    return null;
  }, [leagueData, activeFilter]);
  


  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      
      {/* NAGŁÓWEK Z ZAKŁADKAMI */}
      <div className="bg-slate-50 border-b border-slate-200 flex flex-wrap">
        
        {Object.entries(QUEUE_FILTERS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key as QueueKey)}
            className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 outline-none ${
              activeFilter === key
                ? "border-blue-500 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>
       
      {/* ZAWARTOŚĆ */}
      <div className="p-6">
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            
            {/* 1. KOŁO WINRATE */}
            <div className="flex flex-col items-center justify-center border-r-0 md:border-r border-slate-100 pr-0 md:pr-6">
               <div className="relative w-24 h-24 mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <circle 
                        cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={251.2} 
                        strokeDashoffset={251.2 - (251.2 * stats.winrate) / 100} 
                        className={`${stats.winrate >= 50 ? 'text-blue-500' : 'text-red-500'} transition-all duration-1000`} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xl font-black text-slate-800">{stats.winrate}%</span>
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Winrate</span>
                  </div>
               </div>
               <div className="text-xs text-slate-500 font-medium">
                  <span className="text-blue-600 font-bold">{stats.wins}W</span> - <span className="text-red-500 font-bold">{stats.losses}L</span>
                  <span className="mx-1 text-slate-300">|</span>
                  {stats.games} Games
               </div>
            </div>

            {/* 2. STATYSTYKI KDA */}
            <div className="flex flex-col items-center md:items-start justify-center gap-2 border-r-0 md:border-r border-slate-100 px-0 md:px-6">
                <div className="text-center md:text-left">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                        <FaCrosshairs /> KDA Ratio
                    </p>
                    <p className={`text-3xl font-black ${Number(stats.kda) >= 3 ? 'text-blue-600' : 'text-slate-700'}`}>
                        {stats.kda}
                    </p>
                </div>
                <div className="text-sm text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <span className="font-bold">{stats.avgKills}</span> / <span className="text-red-500 font-bold">{stats.avgDeaths}</span> / <span className="font-bold">{stats.avgAssists}</span>
                </div>
            </div>

            {/* 3. POZOSTAŁE STATY (CS, DMG) */}
            <div className="space-y-3 px-0 md:px-6 border-r-0 md:border-r border-slate-100">
                <StatRow label="Avg. CS" value={`${stats.avgCs} (${stats.csPerMin}/min)`} icon={<FaChartPie />} />
                <StatRow label="Avg. Damage" value={stats.avgDmg} icon={<FaSkull />} />
            </div>

            {/* 4. RANGA (Zaktualizowana o obrazek) */}

            
            
            <div className="flex flex-col items-center justify-center pl-0 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:border-none">
                {currentRank ? (

                  
                    <>
                        {/* WYŚWIETLANIE EMBLEMATU */}
                        <div className="w-20 h-20 mb-2 transition-transform hover:scale-110 duration-300">
                          <h2>test</h2>
                            <img 
                                src={RANK_ICONS[currentRank.tier]} 
                                alt={currentRank.tier} 
                                className="w-full h-full object-contain drop-shadow-sm"
                            />
                        </div>
                        
                        <p className={`text-xl font-black tracking-tighter uppercase ${getColorForTier(currentRank.tier)}`}>
                            {currentRank.tier} {currentRank.rank}
                        </p>
                        <p className="text-xs text-slate-500 font-bold">{currentRank.leaguePoints} LP</p>
                    </>
                ) : (
                    <div className="text-center text-slate-400 opacity-60">
                        <FaGamepad size={32} className="mx-auto mb-2" />
                        <p className="text-xs font-medium">Brak danych rankingowych<br/>dla tej kolejki</p>
                    </div>
                )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
             <FaGamepad size={40} className="mb-3 opacity-20" />
             <p>Brak zagranych gier w trybie: <span className="font-bold text-slate-600">{QUEUE_FILTERS[activeFilter].label}</span></p>
             <p className="text-xs mt-1">w ostatnich 20 meczach.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- POMOCNICZE KOMPONENTY ---

const StatRow = ({ label, value, icon }: { label: string, value: string | number, icon: any }) => (
    <div className="flex items-center justify-between w-full text-sm">
        <span className="text-slate-500 flex items-center gap-2">{icon} {label}</span>
        <span className="font-bold text-slate-800">{value}</span>
    </div>
);

const getColorForTier = (tier: string) => {
    switch(tier) {
        case "IRON": return "text-zinc-500";
        case "BRONZE": return "text-amber-700";
        case "SILVER": return "text-slate-400";
        case "GOLD": return "text-yellow-500";
        case "PLATINUM": return "text-cyan-500";
        case "EMERALD": return "text-emerald-500";
        case "DIAMOND": return "text-blue-400";
        case "MASTER": return "text-purple-500";
        case "GRANDMASTER": return "text-red-500";
        case "CHALLENGER": return "text-amber-300";
        default: return "text-slate-800";
    }
}