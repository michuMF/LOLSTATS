// src/pages/ChampionsPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { FaSearch, FaFire, FaChartLine, FaLayerGroup, FaTimes, FaGlobeAmericas } from 'react-icons/fa';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { analyzeMeta, type AnalysisResult } from '../utils/metaAnalysis';
import { useDDragon } from '../hooks/useDragonData';


// --- TYPY ---
interface ItemStat { picks: number; wins: number; }
interface ChampionMeta { matchesAnalyzed: number; items: Record<string, ItemStat>; }
type TierData = Record<string, ChampionMeta>;
type MetaDatabase = Record<string, TierData>;

interface ChampionBase {
  id: string;
  key: string;
  name: string;
  title: string;
}

const ORDERED_TIERS = [
  'ALL', 'CHALLENGER', 'GRANDMASTER', 'MASTER', 
  'DIAMOND', 'EMERALD', 'PLATINUM', 
  'GOLD', 'SILVER', 'BRONZE', 'IRON'
];

export const ChampionsPage = () => {
  const { version: ddragonVersion } = useDDragon(); // 1. Używamy najnowszej wersji
  
  const [metaData, setMetaData] = useState<MetaDatabase | null>(null);
  const [champions, setChampions] = useState<ChampionBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedChamp, setSelectedChamp] = useState<ChampionBase | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  // A. Pobieranie Postaci (Z dynamiczną wersją)
  useEffect(() => {
    const fetchChamps = async () => {
      try {
        // Pobieramy wersję najpierw, lub używamy fallback jeśli hook jeszcze nie gotowy
        const ver = ddragonVersion || "14.24.1";
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ver}/data/en_US/champion.json`);
        const data = await res.json();
        const list = Object.values(data.data) as ChampionBase[];
        setChampions(list.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      } catch (e) {
        console.error("Failed to fetch champions", e);
        setLoading(false);
      }
    };
    if (ddragonVersion) fetchChamps();
  }, [ddragonVersion]);

  // B. Pobieranie Bazy Danych (ASYNC - Zapobiega crashom UI)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Dynamic import - przeglądarka pobiera plik dopiero teraz, nie blokując renderowania
        const module = await import('../data/meta_data_v2.json');
        setMetaData(module.default as unknown as MetaDatabase);
      } catch (e) {
        console.error("Nie znaleziono pliku z danymi meta_data_v2.json. Uruchom backend!", e);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  // C. Logika Dostępnych Rang
  const availableTiers = useMemo(() => {
    if (!metaData) return [];
    const dbKeys = Object.keys(metaData);
    const existing = ORDERED_TIERS.filter(tier => tier === 'ALL' || dbKeys.includes(tier));
    return dbKeys.length === 0 ? [] : existing;
  }, [metaData]);

  // D. Filtrowanie
  const filteredChampions = useMemo(() => {
    if (!search) return champions;
    const lower = search.toLowerCase();
    return champions.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.id.toLowerCase().includes(lower)
    );
  }, [champions, search]);

  // E. ANALIZA (Zabezpieczona przed crashem)
  const analysis = useMemo<AnalysisResult | null>(() => {
    if (!selectedChamp || !metaData) return null;

    try {
        let rawStats: ChampionMeta | null = null;

        if (selectedTier === 'ALL') {
            const aggregated: ChampionMeta = { matchesAnalyzed: 0, items: {} };
            
            Object.values(metaData).forEach((tierData) => {
                if (!tierData) return;
                const champStats = tierData[selectedChamp.key];
                if (champStats) {
                    aggregated.matchesAnalyzed += champStats.matchesAnalyzed;
                    Object.entries(champStats.items).forEach(([itemId, stats]) => {
                        if (!aggregated.items[itemId]) aggregated.items[itemId] = { picks: 0, wins: 0 };
                        aggregated.items[itemId].picks += stats.picks;
                        aggregated.items[itemId].wins += stats.wins;
                    });
                }
            });

            if (aggregated.matchesAnalyzed > 0) rawStats = aggregated;

        } else {
            const tierData = metaData[selectedTier];
            if (tierData) rawStats = tierData[selectedChamp.key];
        }
        
        return analyzeMeta(rawStats);
    } catch (err) {
        console.error("Błąd podczas analizy danych:", err);
        return null;
    }
  }, [selectedChamp, selectedTier, metaData]);

  if (loading || dataLoading) return <div className="pt-20"><LoadingSpinner /></div>;

  return (
    <div className="container mx-auto p-6 pt-20 text-white min-h-screen relative">
      
      {/* HEADER */}
      <div className="text-center mb-10 animate-fade-in-down">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent mb-3">
          Meta Analysis
        </h1>
        <p className="text-slate-400 text-lg">
          Patch: <span className="text-yellow-400 font-mono">{ddragonVersion}</span> • Globalna analiza itemizacji
        </p>
      </div>

      {/* KONTROLKI */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 max-w-5xl mx-auto">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-4 top-3.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Szukaj postaci..." 
            className="w-full bg-slate-800/80 border border-slate-700 rounded-full py-3 pl-10 pr-4 text-white focus:border-yellow-500 focus:outline-none transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
           {availableTiers.length > 0 ? (
               availableTiers.map(tier => {
                 const isAll = tier === 'ALL';
                 const isSelected = selectedTier === tier;
                 return (
                   <button
                     key={tier}
                     onClick={() => setSelectedTier(tier)}
                     className={`
                       px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all border flex items-center gap-1
                       ${isSelected 
                          ? (isAll ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105' : 'bg-yellow-500 text-black border-yellow-500 shadow-lg scale-105') 
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                       }
                     `}
                   >
                     {isAll && <FaGlobeAmericas size={10} />}
                     {isAll ? "WSZYSTKIE" : tier}
                   </button>
                 );
               })
           ) : (
               <span className="text-xs text-red-400 bg-red-900/20 px-3 py-1 rounded border border-red-900/50">
                   Brak danych w bazie (uruchom backend)
               </span>
           )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        
        {/* LEWA STRONA: GRID POSTACI */}
        <div className={`
            grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-3 content-start transition-all duration-500 ease-in-out
            ${selectedChamp ? 'lg:w-1/2 h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar' : 'w-full'}
        `}>
          {filteredChampions.map(champ => {
             // Sprawdzanie dostępności danych (Safe Check)
             let hasData = false;
             if (metaData) {
                 if (selectedTier === 'ALL') {
                     hasData = Object.values(metaData).some(tierData => tierData && !!tierData[champ.key]);
                 } else {
                     hasData = !!(metaData[selectedTier] && metaData[selectedTier][champ.key]);
                 }
             }

             return (
              <div 
                key={champ.key}
                onClick={() => setSelectedChamp(champ)}
                className={`
                  cursor-pointer group relative rounded-lg overflow-hidden border transition-all duration-200
                  ${selectedChamp?.key === champ.key 
                      ? 'border-yellow-500 ring-2 ring-yellow-500/50 scale-105 z-10' 
                      : 'border-slate-800 hover:border-slate-500 hover:-translate-y-1'
                  }
                  ${!hasData ? 'opacity-40 grayscale hover:grayscale-0 hover:opacity-80' : ''}
                `}
              >
                <img 
                  // UŻYWAMY DYNAMICZNEJ WERSJI TUTAJ:
                  src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${champ.id}.png`}
                  alt={champ.name}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-1 text-center">
                  <p className="text-[10px] sm:text-xs font-semibold truncate text-slate-200">{champ.name}</p>
                </div>
                {hasData && <div className={`absolute top-1 right-1 w-2 h-2 rounded-full shadow-sm ${selectedTier === 'ALL' ? 'bg-blue-500' : 'bg-green-500'}`}></div>}
              </div>
             );
          })}
        </div>

        {/* PRAWA STRONA: PANEL DETALI */}
        {selectedChamp && (
          <div className="lg:w-1/2 w-full sticky top-24 animate-slide-in-right">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
                
                <button 
                    onClick={() => setSelectedChamp(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white lg:hidden"
                >
                    <FaTimes size={24} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/5">
                  <div className="relative">
                    <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${selectedChamp.id}.png`}
                        className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-xl"
                        alt={selectedChamp.name}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1.5 border border-slate-700">
                        <FaLayerGroup className={selectedTier === 'ALL' ? "text-blue-500" : "text-yellow-500"} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-1">{selectedChamp.name}</h2>
                    <p className="text-yellow-500 font-mono text-sm tracking-wide uppercase">{selectedChamp.title}</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-400 border border-slate-700/50">
                        <span>Dane: <strong className="text-white">{selectedTier === 'ALL' ? 'WSZYSTKIE RANGI' : selectedTier}</strong></span>
                        <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                        <span>Próbka: <strong className="text-white">{analysis?.matchesAnalyzed || 0}</strong> gier</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {!analysis ? (
                  <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
                    <p className="text-slate-400 text-lg mb-2">Brak danych.</p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* CORE BUILD */}
                    <div>
                      <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                        <FaFire className="text-orange-500" /> Core Build
                      </h3>
                      <div className="space-y-2">
                        {analysis.coreItems.map((item, idx) => (
                          <div key={item.id} className="flex items-center bg-slate-900/40 p-2 rounded-lg border border-slate-700/50 hover:bg-slate-700/30 transition-colors group">
                            <div className="font-mono text-slate-500 w-8 text-center text-sm">#{idx + 1}</div>
                            <img 
                              // DYNAMICZNA WERSJA
                              src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/item/${item.id}.png`}
                              className="w-10 h-10 rounded border border-slate-600 group-hover:border-orange-500/50"
                              alt="Item"
                              // Obsługa błędu obrazka
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                            <div className="flex-1 ml-4 mr-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300">Pick Rate</span>
                                    <span className="font-bold text-orange-400">{item.pickRate}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{ width: `${item.pickRate}%` }}></div>
                                </div>
                            </div>
                            <div className="w-16 text-right">
                                <div className="text-[10px] text-slate-400 mb-0.5">Win Rate</div>
                                <div className={`text-sm font-bold ${item.winRate > 50 ? "text-green-400" : "text-slate-300"}`}>
                                    {item.winRate}%
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* WINNING ITEMS */}
                    <div>
                      <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                        <FaChartLine className="text-green-400" /> Winning Items
                      </h3>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {analysis.winningItems.map(item => (
                          <div key={item.id} className="group relative bg-slate-900/40 p-2 rounded-xl border border-slate-700/50 flex flex-col items-center hover:border-green-500/30 transition-colors">
                            <img 
                              src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/item/${item.id}.png`}
                              className="w-10 h-10 rounded mb-2 border border-slate-600 group-hover:border-green-400"
                              alt="Item"
                            />
                            <span className="text-green-400 font-bold text-xs">{item.winRate}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChampionsPage;