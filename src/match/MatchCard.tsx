import { FaAngleDown, FaAngleUp, FaRobot } from "react-icons/fa";
import type { MatchDetailsType } from "../types/types";
import { analyzeMatch } from "../utils/analyzeMatch";
import { spellMap } from "../utils/constants";
import { getQueueName } from "../utils/mappers";
import { MatchAnalysis } from "./MatchAnalysis";
import { TeamList } from "./TeamList";
import { useMemo } from "react";

interface MatchCardProps {
  match: MatchDetailsType;
  puuid: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const MatchCard = ({ match, puuid, isExpanded, onToggle }: MatchCardProps) => {
  const self = match.info.participants.find((p) => p.puuid === puuid);
  const isWin = self?.win || false;
  
  // Obliczenia AI
  const ai = useMemo(() => {
    return self 
      ? analyzeMatch(self, match.info.participants, match.info.gameDuration) 
      : null;
  }, [self, match.info.participants, match.info.gameDuration]);

  // Style
  const borderClass = isWin ? "border-l-blue-500" : "border-l-red-500";
  const bgHover = isWin ? "hover:bg-blue-50/30" : "hover:bg-red-50/30";
  const badgeBg = isWin ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700";

  const items = [self?.item0, self?.item1, self?.item2, self?.item3, self?.item4, self?.item5];
  const trinket = self?.item6;

  return (
    <li className={`bg-white rounded-r-xl rounded-l-md shadow-sm border border-slate-200 border-l-[6px] ${borderClass} overflow-hidden transition-all duration-200 ${bgHover}`}>
      
      {/* 1. NAGŁÓWEK (Klikalny) */}
      <div onClick={onToggle} className="flex flex-col sm:flex-row items-center cursor-pointer py-4 px-4 sm:px-6 gap-4">
        {/* INFO */}
        <div className="w-full sm:w-32 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-start text-xs text-slate-500">
          <div className="text-left mb-1">
            <p className="font-bold text-slate-700 text-sm">{getQueueName(match.info.queueId)}</p>
            <p>{new Date(match.info.gameEndTimestamp).toLocaleDateString()}</p>
          </div>
          <div className="text-right sm:text-left">
             <span className={`font-bold px-2 py-0.5 rounded text-xs ${badgeBg}`}>
                {isWin ? "WIN" : "LOSS"}
             </span>
             <p className="mt-1 font-mono">{Math.floor(match.info.gameDuration / 60)}m {match.info.gameDuration % 60}s</p>
          </div>
        </div>

        {/* POSTAĆ I STATYSTYKI */}
        {self && (
          <div className="flex items-center gap-4 flex-grow justify-center sm:justify-start">
            <div className="relative">
                <img
                    src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${self.championName}_0.jpg`}
                    alt={self.championName}
                    className="w-14 h-14 rounded-lg object-cover shadow-sm border border-slate-300" loading="lazy"
                />
                <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    {self.champLevel}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                {[self.summoner1Id, self.summoner2Id].map((spellId, idx) => (
                    <img
                    key={idx}
                    src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/spell/${spellMap[spellId] || "SummonerFlash"}.png`}
                    loading="lazy"
                    alt="Spell"
                    className="w-6 h-6 rounded bg-slate-900"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/spell/SummonerFlash.png" }}
                    />
                ))}
            </div>

            <div className="ml-2 sm:ml-6 text-center sm:text-left min-w-[100px]">
              <p className="text-xl font-bold text-slate-800 tracking-wide">
                {self.kills} / <span className="text-red-500">{self.deaths}</span> / {self.assists}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">{((self.kills + self.assists) / Math.max(1, self.deaths)).toFixed(2)}:1</span> KDA
              </p>
              {ai && (
                <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${ai.gradeColor.replace('text-', 'border-').replace('500', '200')} bg-slate-50 text-slate-600`}>
                   <FaRobot className={ai.gradeColor} /> Grade: <span className={ai.gradeColor}>{ai.grade}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ITEMY */}
        <div className="hidden sm:flex flex-wrap items-center gap-1 pl-4 border-l border-slate-100">
          {items.map((itemId, idx) => (
            <div key={idx} className="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden">
              {itemId !== 0 && itemId && (
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/item/${itemId}.png`}
                  loading="lazy"
                  alt={`Item ${itemId}`}
                  className="w-full h-full object-cover opacity-90 hover:opacity-100"
                />
              )}
            </div>
          ))}
          <div className="ml-2 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
            {trinket !== 0 && trinket && (
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/item/${trinket}.png`}
                loading="lazy"
                alt="Trinket"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="text-slate-400 pl-2">
          {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
        </div>
      </div>

      {/* 2. ROZWINIĘCIE */}
      {isExpanded && (
        <div className="bg-slate-50 border-t border-slate-200 animate-in fade-in slide-in-from-top-1 duration-200">
          <MatchAnalysis ai={ai} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-px bg-slate-200">
            <TeamList teamName="Blue Team" color="text-blue-600" participants={match.info.participants.filter(p => p.teamId === 100)} puuid={puuid} />
            <TeamList teamName="Red Team" color="text-red-600" participants={match.info.participants.filter(p => p.teamId === 200)} puuid={puuid} />
          </div>
        </div>
      )}
    </li>
  );
};