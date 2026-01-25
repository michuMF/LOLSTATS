import { useMemo } from "react";
import { FaFire, FaChartLine, FaTimes, FaLayerGroup,} from "react-icons/fa";
import { analyzeMeta } from "../../utils/metaAnalysis";
import type { ChampionBase, MetaDatabase, ChampionMeta } from "../../types/meta";

interface MetaDetailsPanelProps {
  champion: ChampionBase;
  tier: string;
  metaData: MetaDatabase | null;
  version: string;
  onClose: () => void;
}

export const MetaDetailsPanel = ({ champion, tier, metaData, version, onClose }: MetaDetailsPanelProps) => {
  
  const analysis = useMemo(() => {
    if (!metaData) return null;

    // WAŻNE: Twój JSON używa ID jako klucza ("1"), a nie nazwy ("Annie"). 
    // DDragon 'key' to właśnie to ID w formie stringa.
    const championId = champion.key; 

    let rawStats: ChampionMeta | null = null;
    let estimatedWinRate = 0;

    try {
        // --- 1. AGREGACJA DANYCH ---
        if (tier === 'ALL') {
            const aggregated: ChampionMeta = { matchesAnalyzed: 0, items: {} };
            
            Object.values(metaData).forEach((tierData) => {
                const stats = tierData?.[championId]; // Używamy ID
                if (stats) {
                    aggregated.matchesAnalyzed += stats.matchesAnalyzed;
                    
                    // Sumujemy itemy
                    Object.entries(stats.items).forEach(([itemId, s]) => {
                        if (!aggregated.items[itemId]) aggregated.items[itemId] = { picks: 0, wins: 0 };
                        aggregated.items[itemId].picks += s.picks;
                        aggregated.items[itemId].wins += s.wins;
                    });
                }
            });
            if (aggregated.matchesAnalyzed > 0) rawStats = aggregated;
        } else {
            rawStats = metaData[tier]?.[championId] || null;
        }

        // --- 2. WYLICZANIE WINRATE Z ITEMÓW ---
        if (rawStats && rawStats.matchesAnalyzed > 0) {
            let totalItemPicks = 0;
            let totalItemWins = 0;

            // Sumujemy wszystkie picki i winy wszystkich itemów
            Object.values(rawStats.items).forEach((itemStat) => {
                totalItemPicks += itemStat.picks;
                totalItemWins += itemStat.wins;
            });

            // Matematyczne przybliżenie WR postaci
            if (totalItemPicks > 0) {
                estimatedWinRate = Math.round((totalItemWins / totalItemPicks) * 100);
            }
        }

        const details = analyzeMeta(rawStats);
        // Doklejamy nasz wyliczony WR do wyniku
        return details ? { ...details, overallWinRate: estimatedWinRate } : null;

    } catch (e) {
        console.error("Analysis Error:", e);
        return null;
    }
  }, [champion, tier, metaData]);

  // Helper do kolorów
  const getWrColor = (wr: number) => {
      if (wr >= 52) return "text-green-400";
      if (wr >= 49) return "text-yellow-400";
      return "text-red-400";
  };

  return (
    <div className="lg:w-1/2 w-full sticky top-24 animate-slide-in-right">
      <div className="bg-slate-800/90 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
         <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white lg:hidden">
            <FaTimes size={24} />
         </button>

         {/* Header Sekcja */}
         <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/5">
             <img 
               src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.id}.png`}
               className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-xl"
               alt={champion.name}
             />
             <div className="flex-1">
                 <h2 className="text-4xl font-bold text-white mb-1">{champion.name}</h2>
                 <p className="text-yellow-500 font-mono text-sm uppercase">{champion.title}</p>
                 
                 <div className="flex flex-wrap gap-3 mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg text-xs text-slate-400 border border-slate-700/50">
                        <FaLayerGroup /> {tier === 'ALL' ? "GLOBAL" : tier}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg text-xs text-slate-400 border border-slate-700/50">
                         {analysis?.matchesAnalyzed || 0} Matches
                    </div>
                 </div>
             </div>

             {/* TUTAJ: Wielki Procent Win Rate */}
             {analysis && (
                 <div className="text-right px-4">
                     <div className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Win Rate</div>
                     <div className={`text-5xl font-black ${getWrColor(analysis.overallWinRate)} drop-shadow-lg`}>
                         {analysis.overallWinRate}%
                     </div>
                 </div>
             )}
         </div>

         {/* Reszta: Buildy */}
         {!analysis ? (
             <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                Brak danych dla tej rangi.
             </div>
         ) : (
             <div className="space-y-8 animate-fadeIn">
                 {/* ... (Tu wklej resztę kodu buildów z poprzedniej odpowiedzi: Core Items, Winning Items) ... */}
                 
                 {/* CORE BUILD */}
                 <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4"><FaFire className="text-orange-500"/> Core Items</h3>
                    <div className="space-y-2">
                        {analysis.coreItems.map((item, i) => (
                            <div key={item.id} className="flex items-center bg-slate-900/40 p-2 rounded border border-slate-700/50 hover:bg-slate-800/50 transition">
                                <span className="w-6 text-center text-slate-500 font-mono text-sm">#{i+1}</span>
                                <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.id}.png`} className="w-10 h-10 rounded mx-3 border border-slate-600" />
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                                        <span>Pick: <b className="text-orange-400">{item.pickRate}%</b></span>
                                        <span>Win: <b className={item.winRate > 50 ? "text-green-400" : "text-slate-400"}>{item.winRate}%</b></span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400" style={{width: `${item.pickRate}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* WINNING ITEMS */}
                 <div>
                     <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4"><FaChartLine className="text-green-400"/> High Winrate</h3>
                     <div className="grid grid-cols-5 gap-3">
                         {analysis.winningItems.map(item => (
                             <div key={item.id} className="relative group bg-slate-900/40 p-2 rounded-xl border border-slate-700/50 hover:border-green-500/50 transition flex flex-col items-center">
                                 <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.id}.png`} className="w-10 h-10 rounded mb-2 shadow-sm" />
                                 <span className="text-green-400 font-bold text-xs">{item.winRate}%</span>
                             </div>
                         ))}
                     </div>
                 </div>

             </div>
         )}
      </div>
    </div>
  );
};