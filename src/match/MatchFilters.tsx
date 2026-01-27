// src/match/MatchFilters.tsx
import { useMemo } from "react";
import type { MatchDetailsType } from "../api/fetchMatchDetails";

interface MatchFiltersProps {
  matches: MatchDetailsType[] | undefined;
  selectedSeason: string;
  onSelectSeason: (season: string) => void;
}

// Funkcja pomocnicza (może zostać tutaj lub w utilsach)
const getSeasonFromVersion = (version: string) => {
  return version.split(".")[0];
};

export const MatchFilters = ({ matches, selectedSeason, onSelectSeason }: MatchFiltersProps) => {
  // 1. OBLICZANIE DOSTĘPNYCH SEZONÓW
  const availableSeasons = useMemo(() => {
    if (!matches) return [];

    const seasons = new Set<string>();
    matches.forEach((match) => {
      const season = getSeasonFromVersion(match.info.gameVersion);
      seasons.add(season);
    });

    // Sortujemy malejąco (16, 15, 14...)
    return Array.from(seasons).sort((a, b) => Number(b) - Number(a));
  }, [matches]);

  return (
    <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
      {/* Przycisk WSZYSTKIE */}
      <button
        onClick={() => onSelectSeason("ALL")}
        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
          selectedSeason === "ALL"
            ? "bg-white text-slate-800 shadow-sm border border-slate-200"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
        }`}
      >
        All
      </button>

      {/* Generowanie przycisków dla wykrytych sezonów */}
      {availableSeasons.map((season) => (
        <button
          key={season}
          onClick={() => onSelectSeason(season)}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
            selectedSeason === season
              ? "bg-white text-blue-600 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
          }`}
        >
          S{season}
        </button>
      ))}
    </div>
  );
};
