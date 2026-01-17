// src/match/MatchList.tsx
import { useState, useMemo } from "react";

import { MatchCard } from "./MatchCard";
import { MatchFilters } from "./MatchFilters"; // Importujemy nowy komponent
import type { MatchDetailsType } from "../types";

export const MatchList = ({
  matchDetails,
  puuid,
}: {
  matchDetails?: MatchDetailsType[];
  puuid: string;
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('ALL');

  const toggleMatch = (gameId: number) => {
    setExpandedMatchId(expandedMatchId === gameId ? null : gameId);
  };

  // Logika filtrowania listy pozostaje tutaj (List odpowiada za wyświetlanie właściwych danych)
  const filteredMatches = useMemo(() => {
      if (!matchDetails) return [];
      
      return matchDetails.filter((match) => {
        if (selectedSeason === 'ALL') return true;
        return match.info.gameVersion.startsWith(selectedSeason + '.');
      });
  }, [matchDetails, selectedSeason]);

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 pl-2 border-l-4 border-slate-800 gap-4">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
           Match History 
           <span className="text-xs font-normal text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-0.5 rounded">
             AI 2.0 Enabled
           </span>
        </h3>

        {/* UŻYCIE NOWEGO KOMPONENTU */}
        <MatchFilters 
            matches={matchDetails} 
            selectedSeason={selectedSeason} 
            onSelectSeason={setSelectedSeason} 
        />
      </div>
      
      <ul className="space-y-4">
        {filteredMatches && filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
                <MatchCard 
                    key={match.info.gameId}
                    match={match}
                    puuid={puuid}
                    isExpanded={expandedMatchId === match.info.gameId}
                    onToggle={() => toggleMatch(match.info.gameId)}
                />
            ))
        ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">
                    No matches found for {selectedSeason === 'ALL' ? 'history' : `Season ${selectedSeason}`}.
                </p>
                {selectedSeason !== 'ALL' && (
                    <button 
                        onClick={() => setSelectedSeason('ALL')}
                        className="text-blue-500 text-sm font-bold mt-2 hover:underline"
                    >
                        Show all seasons
                    </button>
                )}
            </div>
        )}
      </ul>
    </div>
  );
};