import { useState, useMemo } from "react";
import { Link } from "react-router-dom"; // <--- Import Link
import { FaSearch, FaGlobeAmericas, FaArrowLeft } from "react-icons/fa"; // <--- Import Strzałki
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { useMetaPageData } from "../hooks/useMetaPageData";
import { MetaDetailsPanel } from "../components/meta/MetaDetailsPanel";
import type { ChampionBase } from "../types/meta";

export const MetaAnalysisPage = () => {
  const { metaData, champions, availableTiers, loading, error, version } = useMetaPageData();

  const [search, setSearch] = useState("");
  const [selectedChamp, setSelectedChamp] = useState<ChampionBase | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

  const filteredChampions = useMemo(() => {
    if (!search) return champions;
    const lower = search.toLowerCase();
    return champions.filter((c) => c.name.toLowerCase().includes(lower));
  }, [champions, search]);

  if (loading)
    return (
      <div className="pt-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="pt-20 flex justify-center">
        <ErrorMessage message={error} />
      </div>
    );

  return (
    <div className="container mx-auto p-6 pt-10 text-white min-h-screen relative animate-fadeIn">
      {/* --- NAWIGACJA (BUTTON POWROTU) --- */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-all border border-slate-700 shadow-lg font-bold text-sm"
        >
          <FaArrowLeft /> Home
        </Link>
      </div>

      {/* HEADER */}
      <div className="text-center mb-10 mt-6">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">
          Meta Analysis
        </h1>
        <p className="text-slate-400">
          Patch: <span className="text-yellow-400 font-mono">{version}</span> • Global Itemization
          Data
        </p>
      </div>

      {/* PASEK NARZĘDZI */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 max-w-5xl mx-auto bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-4 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Szukaj postaci..."
            className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 pl-10 pr-4 text-white focus:border-yellow-500 focus:outline-none transition-all placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {availableTiers.map((tier) => {
            const isActive = selectedTier === tier;
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1
                       ${isActive ? "bg-yellow-500 text-black border-yellow-500 scale-105 shadow-lg" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"}`}
              >
                {tier === "ALL" && <FaGlobeAmericas />} {tier === "ALL" ? "GLOBAL" : tier}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- RESZTA STRONY BEZ ZMIAN --- */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* LISTA POSTACI */}
        <div
          className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-3 content-start transition-all duration-500 ease-in-out ${selectedChamp ? "lg:w-1/2 h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar" : "w-full"}`}
        >
          {filteredChampions.map((champ) => {
            const hasData =
              metaData &&
              (selectedTier === "ALL"
                ? Object.values(metaData).some((td) => td?.[champ.key])
                : metaData[selectedTier]?.[champ.key]);

            return (
              <div
                key={champ.key}
                onClick={() => setSelectedChamp(champ)}
                className={`cursor-pointer group relative rounded-lg overflow-hidden border transition-all duration-200
                       ${selectedChamp?.key === champ.key ? "border-yellow-500 ring-2 ring-yellow-500/50 scale-105 z-10" : "border-slate-800 hover:border-slate-500 hover:-translate-y-1"}
                       ${!hasData ? "opacity-40 grayscale hover:grayscale-0 hover:opacity-80" : ""}`}
              >
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png`}
                  loading="lazy"
                  alt={champ.name}
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-sm text-center text-[10px] py-1 text-slate-200 font-bold truncate px-1">
                  {champ.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* PANEL DETALI */}
        {selectedChamp && (
          <MetaDetailsPanel
            champion={selectedChamp}
            tier={selectedTier}
            metaData={metaData}
            version={version}
            onClose={() => setSelectedChamp(null)}
          />
        )}
      </div>
    </div>
  );
};
