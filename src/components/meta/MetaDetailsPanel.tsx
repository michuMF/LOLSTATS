import { useMemo } from "react";
import { FaFire, FaChartLine, FaTimes, FaLayerGroup, FaMagic, FaGem } from "react-icons/fa";
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
        const championId = champion.key;

        let rawStats: ChampionMeta | null = null;
        let estimatedWinRate = 0;

        try {
            // --- 1. AGREGACJA DANYCH ---
            if (tier === 'ALL') {
                // Inicjalizacja: matches=0, items={}, marketing={}
                const aggregated: ChampionMeta = {
                    matches: 0,
                    matchesAnalyzed: 0,
                    items: {},
                    marketing: { keystones: {}, secondaryTrees: {}, spells: {} }
                };

                Object.values(metaData).forEach((tierData) => {
                    const stats = tierData?.[championId];
                    if (stats) {
                        // Obsługa V1 matchesAnalyzed vs V2 matches
                        const m = stats.matches ?? stats.matchesAnalyzed ?? 0;
                        aggregated.matches = (aggregated.matches || 0) + m;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (aggregated as any).matchesAnalyzed = aggregated.matches; // backward compat

                        // Sumujemy itemy
                        if (stats.items) {
                            Object.entries(stats.items).forEach(([itemId, s]) => {
                                if (!aggregated.items[itemId]) aggregated.items[itemId] = { picks: 0, wins: 0 };
                                aggregated.items[itemId].picks += s.picks;
                                aggregated.items[itemId].wins += s.wins;
                            });
                        }

                        // Sumujemy marketing (Runy i Spelle)
                        if (stats.marketing && aggregated.marketing) {
                            // Helper do sumowania bucketów
                            const sumBucket = (target: Record<string, { picks: number, wins: number }>, source: Record<string, { picks: number, wins: number }>) => {
                                Object.entries(source).forEach(([k, v]) => {
                                    if (!target[k]) target[k] = { picks: 0, wins: 0 };
                                    target[k].picks += v.picks;
                                    target[k].wins += v.wins;
                                });
                            };

                            if (stats.marketing.keystones) sumBucket(aggregated.marketing.keystones, stats.marketing.keystones);
                            if (stats.marketing.secondaryTrees) sumBucket(aggregated.marketing.secondaryTrees, stats.marketing.secondaryTrees);
                            if (stats.marketing.spells) sumBucket(aggregated.marketing.spells, stats.marketing.spells);
                        }
                    }
                });
                if ((aggregated.matches || 0) > 0) rawStats = aggregated;
            } else {
                rawStats = metaData[tier]?.[championId] || null;
            }

            // --- 2. WYLICZANIE WINRATE Z ITEMÓW ---
            const matchesCount = rawStats?.matches ?? rawStats?.matchesAnalyzed ?? 0;

            if (rawStats && matchesCount > 0) {
                let totalItemPicks = 0;
                let totalItemWins = 0;

                if (rawStats.items) {
                    Object.values(rawStats.items).forEach((itemStat) => {
                        totalItemPicks += itemStat.picks;
                        totalItemWins += itemStat.wins;
                    });
                }

                if (totalItemPicks > 0) {
                    estimatedWinRate = Math.round((totalItemWins / totalItemPicks) * 100);
                }
            }

            // Konwersja do RawStats (wymagane przez analyzeMeta)
            if (rawStats) {
                // Upewniamy się, że matches jest ustawione
                if (!rawStats.matches && rawStats.matchesAnalyzed) {
                    rawStats.matches = rawStats.matchesAnalyzed;
                }

                // TypeScript workaround: rzutowanie na any/RawStats bo definicje mogą się lekko różnić (optional fields)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const details = analyzeMeta(rawStats as any);
                return details ? { ...details, overallWinRate: estimatedWinRate } : null;
            }
            return null;

        } catch (e) {
            console.error("Analysis Error:", e);
            return null;
        }
    }, [champion, tier, metaData]);

    const getWrColor = (wr: number) => {
        if (wr >= 53) return "text-blue-400"; // Wybitne
        if (wr >= 50) return "text-green-400"; // Dobre
        if (wr >= 48) return "text-slate-300"; // Ok
        return "text-red-400"; // Słabe
    };

    return (
        <div className="lg:w-1/2 w-full sticky top-24 animate-slide-in-right mb-20">
            <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">

                {/* Tło ozdobne */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white lg:hidden z-10">
                    <FaTimes size={24} />
                </button>

                {/* --- HEADER --- */}
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/5 relative z-10">
                    <div className="relative group">
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.id}.png`}
                            className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-xl group-hover:scale-105 transition-transform"
                            alt={champion.name}
                        />
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-2 border border-slate-700">
                            <FaLayerGroup className={tier === 'ALL' ? "text-blue-400" : "text-yellow-400"} />
                        </div>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-4xl font-black text-white tracking-tight">{champion.name}</h2>
                        <p className="text-yellow-500 font-mono text-sm uppercase tracking-wider opacity-80">{champion.title}</p>

                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-slate-900/60 rounded-lg text-xs font-medium text-slate-300 border border-slate-700/50">
                                {tier === 'ALL' ? "GLOBAL DATA" : tier}
                            </span>
                            <span className="px-3 py-1 bg-slate-900/60 rounded-lg text-xs font-medium text-slate-300 border border-slate-700/50">
                                {analysis?.matchesAnalyzed.toLocaleString() || 0} Matches
                            </span>
                        </div>
                    </div>

                    {/* WIN RATE BIG DISPLAY */}
                    {analysis && (
                        <div className="text-right px-2 hidden sm:block">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Estimated WR</div>
                            <div className={`text-5xl font-black ${getWrColor(analysis.overallWinRate)} drop-shadow-lg`}>
                                {analysis.overallWinRate}%
                            </div>
                        </div>
                    )}
                </div>

                {/* --- CONTENT --- */}
                {!analysis ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                        <FaLayerGroup className="text-4xl mb-3 opacity-30" />
                        <p>Brak wystarczającej liczby danych dla tej rangi.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 animate-fadeIn">

                        {/* 1. RUNES & SPELLS ROW */}
                        <div className="flex flex-col md:flex-row gap-6">

                            {/* RUNES */}
                            {analysis.runes.keystone && (
                                <div className="flex-1 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                                        <FaGem className="text-emerald-400" /> Best Runes
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <img
                                                src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${analysis.runes.keystone.id}.png`}
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                                className="w-12 h-12 rounded-full ring-2 ring-emerald-500/20 mb-1"
                                                title={`Keystone: ${analysis.runes.keystone.id}`}
                                            />
                                            <span className="text-[10px] text-emerald-400 uppercase font-bold">Keystone</span>
                                        </div>
                                        <div className="h-8 w-px bg-slate-700/50 mx-2"></div>
                                        <div className="flex flex-col items-center">
                                            {/* Secondary Tree Icon - trudne bez mappingu, używamy placeholder lub nazwy */}
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600">
                                                <span className="text-xs font-bold text-slate-400">{analysis.runes.secondaryTree?.id}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">Secondary</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUMMONER SPELLS */}
                            {analysis.spells.length > 0 && (
                                <div className="flex-1 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                                        <FaMagic className="text-purple-400" /> Summoners
                                    </h3>
                                    <div className="flex gap-2">
                                        {analysis.spells[0].ids.map(id => (
                                            <img
                                                key={id}
                                                src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/spell/Summoner${id === 4 ? "Flash" :
                                                    id === 14 ? "Dot" :
                                                        id === 11 ? "Smite" :
                                                            id === 12 ? "Teleport" :
                                                                id === 6 ? "Haste" :
                                                                    id === 7 ? "Heal" :
                                                                        id === 3 ? "Exhaust" :
                                                                            id === 21 ? "Barrier" : "Flash"
                                                    }.png`}
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                                className="w-10 h-10 rounded border border-slate-600"
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-2 text-xs text-slate-400">
                                        Win Rate: <span className={getWrColor(analysis.spells[0].winRate)}>{analysis.spells[0].winRate}%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. ITEMS GRID */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                            {/* LEWA KOLUMNA: CORE BUILD */}
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4 border-b border-slate-700/50 pb-2">
                                    <FaFire className="text-orange-500" />
                                    Most Popular <span className="text-slate-500 text-xs font-normal ml-auto">(Pick Rate)</span>
                                </h3>

                                <div className="space-y-3">
                                    {analysis.coreItems.map((item, i) => (
                                        <div key={item.id} className="flex items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 hover:border-orange-500/30 transition-all group">
                                            <span className="w-6 text-center text-slate-600 font-mono text-xs font-bold">#{i + 1}</span>

                                            <img
                                                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.id}.png`}
                                                className="w-11 h-11 rounded-lg mx-3 border border-slate-600 group-hover:border-orange-400 transition-colors shadow-sm"
                                                alt="Item"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1.5">
                                                    <div className="text-xs font-bold text-slate-200">
                                                        {item.pickRate}% <span className="text-slate-500 font-normal">Pick</span>
                                                    </div>
                                                    <div className={`text-xs font-bold ${getWrColor(item.winRate)}`}>
                                                        {item.winRate}% WR
                                                    </div>
                                                </div>

                                                {/* Pasek popularności */}
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 shadow-[0_0_10px_rgba(234,88,12,0.5)]"
                                                        style={{ width: `${Math.min(item.pickRate * 1.5, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PRAWA KOLUMNA: SITUATIONAL / HIGH WR */}
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4 border-b border-slate-700/50 pb-2">
                                    <FaChartLine className="text-blue-400" />
                                    Highest Winrate <span className="text-slate-500 text-xs font-normal ml-auto">(Situational)</span>
                                </h3>

                                <div className="grid grid-cols-4 sm:grid-cols-4 xl:grid-cols-3 gap-3">
                                    {analysis.situationalItems.map(item => (
                                        <div key={item.id} className="relative group bg-slate-900/40 p-2 rounded-xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center text-center">

                                            {/* Obrazek */}
                                            <div className="relative mb-2">
                                                <img
                                                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.id}.png`}
                                                    className="w-10 h-10 rounded-lg shadow-md group-hover:scale-110 transition-transform"
                                                    alt="Item"
                                                />
                                                {/* Badge z Pick Rate (mały) */}
                                                <div className="absolute -top-2 -right-2 bg-slate-900 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 shadow-sm">
                                                    {item.pickRate}%
                                                </div>
                                            </div>

                                            {/* Win Rate (Duży) */}
                                            <span className={`text-sm font-black ${getWrColor(item.winRate)}`}>
                                                {item.winRate}%
                                            </span>
                                            <span className="text-[9px] text-slate-500 uppercase font-bold">Win Rate</span>

                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <p className="text-[10px] text-blue-300 leading-relaxed text-center">
                                        Te przedmioty są rzadziej wybierane, ale mają bardzo wysoką skuteczność. Rozważ je jako opcje sytuacyjne.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};