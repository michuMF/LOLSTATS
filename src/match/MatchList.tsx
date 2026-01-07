import { useState } from "react";
import type { MatchDetailsType } from "../types/types";
import { MatchCard } from "./MatchCard";

export const MatchList = ({
  matchDetails, // Zmieniłem nazwę propsa na matchDetails, by pasowało do starego użycia
  puuid,
}: {
  matchDetails?: MatchDetailsType[];
  puuid: string;
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);

  const toggleMatch = (gameId: number) => {
    setExpandedMatchId(expandedMatchId === gameId ? null : gameId);
  };

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto font-sans">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 pl-2 border-l-4 border-slate-800 flex items-center gap-2">
         Match History <span className="text-xs font-normal text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-0.5 rounded">AI 2.0 Enabled</span>
      </h3>
      
      <ul className="space-y-4">
        {matchDetails?.map((match) => (
            <MatchCard 
                key={match.info.gameId}
                match={match}
                puuid={puuid}
                isExpanded={expandedMatchId === match.info.gameId}
                onToggle={() => toggleMatch(match.info.gameId)}
            />
        ))}
      </ul>
    </div>
  );
};