// src/components/player-summary/ExtraStats.tsx
import { useMemo } from "react";
import { FaEye, FaCoins, FaSkull, FaStopwatch } from "react-icons/fa";
import type { MatchDetailsType } from "../../api/fetchMatchDetails";
// Sprawdź poprawność importu

interface ExtraStatsProps {
  matches: MatchDetailsType[];
  puuid: string;
}

export const ExtraStats = ({ matches, puuid }: ExtraStatsProps) => {
  const stats = useMemo(() => {
    let totalVision = 0;
    let totalGold = 0;
    let totalDuration = 0; // w sekundach
    let pentas = 0;
    let quadras = 0;
    
    
    matches.forEach((m) => {
        
        
      const self = m.info.participants.find((p) => p.puuid === puuid);
      
      
      if (self) {
        totalVision += self.visionScore || 0;
        totalGold += self.goldEarned || 0;
        pentas += self.pentaKills || 0;
        quadras += self.quadraKills || 0;
      }
      totalDuration += m.info.gameDuration;
    });

    const games = matches.length || 1;
    const durationMin = totalDuration / 60;

    return {
      avgVision: (totalVision / games).toFixed(1),
      goldPerMin: durationMin > 0 ? (totalGold / durationMin).toFixed(0) : 0,
      pentas,
      quadras,
    };
  }, [matches, puuid]);

  return (
    <div className="grid grid-cols-2 gap-4 px-2 md:px-6 border-t md:border-t-0 border-slate-100 md:border-l pl-4 md:pl-6 pt-4 md:pt-0">
      
      {/* 1. Vision Score */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
          <FaEye /> Avg Vision
        </span>
        <span className="text-lg font-black text-slate-700">{stats.avgVision}</span>
      </div>

      {/* 2. Gold Per Min */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
          <FaCoins /> Gold/Min
        </span>
        <span className="text-lg font-black text-slate-700">{stats.goldPerMin}</span>
      </div>

      {/* 3. Multikills */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
          <FaSkull /> Multikills
        </span>
        <div className="text-xs font-bold text-slate-600">
           {stats.pentas > 0 && <span className="text-red-500 mr-2">{stats.pentas} Penta</span>}
           {stats.quadras > 0 ? <span>{stats.quadras} Quadra</span> : <span>-</span>}
        </div>
      </div>

      {/* 4. Time Played (Avg) */}
      <div className="flex flex-col">
         <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
          <FaStopwatch /> Avg Time
        </span>
        <span className="text-lg font-black text-slate-700">
            {matches.length > 0 
                ? Math.round(matches.reduce((acc, m) => acc + m.info.gameDuration, 0) / matches.length / 60) + "m"
                : "0m"
            }
        </span>
      </div>

    </div>
  );
};