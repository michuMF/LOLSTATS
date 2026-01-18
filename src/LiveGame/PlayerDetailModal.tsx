// src/components/live-game/PlayerDetailModal.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt, FaHistory, FaTimes } from "react-icons/fa";

import { ChampionBuilds } from "./ChampionBuilds";
import type { LiveParticipantDTO } from "../api/fetchLiveGame";
import { fetchMatchDetails, type MatchDetailsType } from "../api/fetchMatchDetails";
import { fetchMatchHistory } from "../api/fetchMatchHistory";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

interface PlayerDetailModalProps {
  participant: LiveParticipantDTO;
  region: string;
  onClose: () => void;
  // --- NOWE PROPSY DO CACHE ---
  cachedMatches?: MatchDetailsType[]; 
  onDataLoaded: (matches: MatchDetailsType[]) => void;
}

export const PlayerDetailModal = ({ 
  participant, 
  region, 
  onClose,
  cachedMatches,
  onDataLoaded
}: PlayerDetailModalProps) => {
  const [statsLoading, setStatsLoading] = useState(!cachedMatches); // Jeśli mamy cache, nie ładujemy
  const [recentMatches, setRecentMatches] = useState<MatchDetailsType[]>(cachedMatches || []);

  // Parsowanie RiotID
  const [gameName, tagLine] = (participant.riotId || "Unknown#EUW").split("#");

  useEffect(() => {
    // 1. Jeśli mamy dane w cache, nie pobieramy ich ponownie!
    if (cachedMatches) {
        setRecentMatches(cachedMatches);
        setStatsLoading(false);
        return;
    }

    const loadQuickStats = async () => {
      // Walidacja czy mamy PUUID (boty go nie mają)
      if (!participant.puuid || participant.bot) {
          setStatsLoading(false);
          return;
      }

      try {
        setStatsLoading(true);
        const matchIds = await fetchMatchHistory(participant.puuid, region);
        const last5Ids = matchIds.slice(0, 5);

        const detailsPromises = last5Ids.map(id => fetchMatchDetails(id, region));
        const details = await Promise.all(detailsPromises);
        
        setRecentMatches(details);
        
        // 2. Zapisz dane w pamięci rodzica (LiveGamePage)
        onDataLoaded(details);

      } catch (err) {
        console.error("Failed to load player stats", err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadQuickStats();
  }, [participant.puuid, region]); // Usunięto cachedMatches z zależności, żeby nie pętlić

  // Obliczanie Winrate
  const wins = recentMatches.filter(m => {
    const p = m.info.participants.find(part => part.puuid === participant.puuid);
    return p?.win;
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
        
        {/* HEADER */}
        <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
                <img 
                    src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/${participant.profileIconId}.png`}
                    alt="Icon"
                    className="w-10 h-10 rounded-full border-2 border-blue-500"
                />
                <div>
                    <h2 className="text-white font-bold text-lg">{gameName}</h2>
                    <span className="text-slate-400 text-xs font-mono">#{tagLine}</span>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                <FaTimes size={20} />
            </button>
        </div>

        {/* BODY */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
            
            {/* Ostatnie mecze */}
            <div className="mb-6">
                <h3 className="text-slate-300 text-sm font-bold uppercase mb-3 flex items-center gap-2">
                    <FaHistory /> Last 5 Matches
                </h3>
                
                {statsLoading ? (
                    <div className="flex justify-center py-4"><LoadingSpinner /></div>
                ) : recentMatches.length > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${(wins / recentMatches.length) * 100}%` }} 
                                />
                            </div>
                            <span className="text-xs font-bold text-blue-400">
                                {Math.round((wins / recentMatches.length) * 100)}% WR
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {recentMatches.map(match => {
                                const p = match.info.participants.find(part => part.puuid === participant.puuid);
                                return (
                                    <div 
                                        key={match.metadata.matchId}
                                        className={`h-8 flex-1 rounded ${p?.win ? 'bg-blue-500/80' : 'bg-red-500/80'}`}
                                        title={p?.win ? "Victory" : "Defeat"}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm italic">Brak historii meczów lub dane niedostępne.</p>
                )}
            </div>

            {/* Sugerowany Build */}
            <ChampionBuilds 
                championId={participant.championId} 
                spell1Id={participant.spell1Id ?? 0} // Zabezpieczenie przed null
                spell2Id={participant.spell2Id ?? 0} 
            />

            {/* Link do profilu */}
            <div className="mt-8 pt-4 border-t border-slate-800">
                <Link 
                    to={`/profile/${region}/${gameName}/${tagLine}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition shadow-lg shadow-blue-500/20"
                >
                    View Full Profile <FaExternalLinkAlt size={14} />
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};