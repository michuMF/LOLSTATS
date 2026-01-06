import React from 'react';
import type { MatchDTO, RankedDataType } from '../types/types';
import { calculatePlayerStats } from '../utils/calculateStats';
import { FaTrophy, FaChartPie, FaFire, FaGamepad } from "react-icons/fa";

interface PlayerSummaryProps {
  matches: MatchDTO[];
  leagueData: RankedDataType[] | undefined | null;
  puuid: string;
}

const PlayerSummary: React.FC<PlayerSummaryProps> = ({ matches, leagueData, puuid }) => {
  if (!matches || matches.length === 0) return null;

  // 1. Obliczamy statystyki z ostatnich gier (Local Helper)
  const recentStats = calculatePlayerStats(matches, puuid);

  // 2. Szukamy danych RANGED (Priorytet: Solo/Duo -> Flex)
  const soloQueue = leagueData?.find((entry) => entry.queueType === "RANKED_SOLO_5x5");
  const flexQueue = leagueData?.find((entry) => entry.queueType === "RANKED_FLEX_SR");
  
  // Wybieramy "Główną" kolejkę do wyświetlenia (Solo, a jak nie ma to Flex)
  const mainQueue = soloQueue || flexQueue;
  
  const hasRankedData = !!mainQueue;
  const seasonWins = mainQueue ? mainQueue.wins : 0;
  const seasonLosses = mainQueue ? mainQueue.losses : 0;
  const seasonGames = seasonWins + seasonLosses;
  const seasonWinRate = seasonGames > 0 ? Math.round((seasonWins / seasonGames) * 100) : 0;
  const queueName = mainQueue?.queueType === "RANKED_SOLO_5x5" ? "Ranked Solo/Duo" : "Ranked Flex";

  // Helpery do kolorów (Dopasowane do stylu Slate)
  const getWrColor = (wr: number) => {
      if (wr >= 60) return "text-amber-500";
      if (wr >= 50) return "text-blue-600";
      return "text-slate-500";
  };

  const getKdaColor = (kdaStr: string) => {
    const kda = parseFloat(kdaStr);
    if (kda >= 4.0) return "text-amber-500";
    if (kda >= 3.0) return "text-blue-600";
    if (kda >= 2.0) return "text-emerald-600";
    return "text-slate-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* KARTA 1: SEZON RANKEDOWY */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <FaTrophy className="text-amber-400" />
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">
                    Sezon 2024 ({hasRankedData ? queueName : "Unranked"})
                </h3>
            </div>
            
            {hasRankedData ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    {/* Wielki Procent */}
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-slate-100">
                         <span className={`text-3xl font-black ${getWrColor(seasonWinRate)}`}>
                             {seasonWinRate}%
                         </span>
                         <span className="absolute -bottom-2 text-[10px] bg-white px-2 text-slate-400 font-bold uppercase">Win Rate</span>
                    </div>
                    
                    {/* W/L */}
                    <div className="text-center mt-2">
                        <p className="text-sm font-bold text-slate-600">{seasonGames} Gier</p>
                        <p className="text-xs text-slate-400">
                           <span className="text-blue-600 font-bold">{seasonWins}W</span> - <span className="text-red-500 font-bold">{seasonLosses}L</span>
                        </p>
                    </div>
                    <div className="mt-2 text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-500">
                        {mainQueue?.tier} {mainQueue?.rank}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm italic">
                    <p>Brak gier rankingowych</p>
                    <p>w tym sezonie.</p>
                </div>
            )}
        </div>

        {/* KARTA 2: BIEŻĄCA FORMA (Ostatnie 20 gier) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <FaChartPie className="text-blue-500" />
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">
                    Forma (Ostatnie {recentStats.totalGames})
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 h-full items-center">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">KDA</p>
                    <p className={`text-2xl font-black ${getKdaColor(recentStats.avgKda)}`}>{recentStats.avgKda}</p>
                    <p className="text-[10px] text-slate-400">Średnia</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">CS/Min</p>
                    <p className="text-2xl font-black text-slate-700">{recentStats.avgCs}</p>
                    <p className="text-[10px] text-slate-400">Farma</p>
                </div>
                <div className="col-span-2 text-center mt-1">
                     <p className="text-xs text-slate-400">Główna rola</p>
                     <p className="font-bold text-slate-800 text-lg flex items-center justify-center gap-2">
                        <FaGamepad className="text-slate-400" /> {recentStats.preferredRole}
                     </p>
                </div>
            </div>
        </div>

        {/* KARTA 3: TOP CHAMPIONS */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <FaFire className="text-red-500" />
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">
                    Top Picks (Recent)
                </h3>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {recentStats.topChampions.map((champ) => {
                    const champWinRate = Math.round((champ.wins / champ.games) * 100);
                    const isHighWr = champWinRate >= 50;
                    
                    return (
                        <div key={champ.championName} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champ.championName}.png`} 
                                    alt={champ.championName}
                                    className="w-8 h-8 rounded bg-slate-200 object-cover"
                                />
                                <div>
                                    <p className="text-xs font-bold text-slate-700 leading-none">{champ.championName}</p>
                                    <p className="text-[10px] text-slate-400">{champ.games} Gier</p>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isHighWr ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                                    {champWinRate}%
                                </span>
                                <p className={`text-[10px] mt-0.5 font-medium ${getKdaColor(((champ.kills + champ.assists) / Math.max(1, champ.deaths)).toFixed(2))}`}>
                                    {((champ.kills + champ.assists) / Math.max(1, champ.deaths)).toFixed(2)} KDA
                                </p>
                            </div>
                        </div>
                    );
                })}
                 {recentStats.topChampions.length === 0 && (
                     <div className="text-slate-400 text-xs text-center py-4 italic">Brak danych o postaciach</div>
                )}
            </div>
        </div>
    </div>
  );
};

export default PlayerSummary;