// src/components/player-summary/PlayerSummary.tsx
import { useState, useMemo } from "react";
import { FaGamepad } from "react-icons/fa";

// <-- Dostosuj importy
import type { RankedDataType } from "../../api/fetchRankedData";

// Komponenty składowe
import { QueueTabs, QUEUE_FILTERS, type QueueKey } from "./QueueTabs";
import { WinRateChart } from "./WinRateChart";
import { StatsDisplay } from "./StatsDisplay";
import { RankCard } from "./RankCard";
import { ExtraStats } from "./ExtraStats"; // <--- NOWY IMPORT
import type { MatchDetailsType } from "../../api/fetchMatchDetails";

interface PlayerSummaryProps {
  matches: MatchDetailsType[];
  leagueData: RankedDataType[] | null;
  puuid: string;
}

export const PlayerSummary = ({ leagueData, puuid, matches }: PlayerSummaryProps) => {
  const [activeFilter, setActiveFilter] = useState<QueueKey>("ALL");

  // --- 1. FILTROWANIE ---
  const filteredMatches = useMemo(() => {
    if (activeFilter === "ALL") return matches;
    return matches.filter((m) => m.info.queueId === QUEUE_FILTERS[activeFilter].id);
  }, [matches, activeFilter]);

  // --- 2. OBLICZANIE STATYSTYK OGÓLNYCH ---
  const stats = useMemo(() => {
    if (!filteredMatches.length) return null;

    let wins = 0;
    let kills = 0;
    let deaths = 0;
    let assists = 0;
    let cs = 0;
    let damage = 0;
    let duration = 0;

    filteredMatches.forEach((match) => {
      const self = match.info.participants.find((p) => p.puuid === puuid);
      if (self) {
        if (self.win) wins++;
        kills += self.kills;
        deaths += self.deaths;
        assists += self.assists;
        cs += (self.totalMinionsKilled || 0) + (self.neutralMinionsKilled || 0);
        damage += self.totalDamageDealtToChampions;
      }
      duration += match.info.gameDuration;
    });

    const games = filteredMatches.length;
    return {
      games,
      wins,
      losses: games - wins,
      winrate: Math.round((wins / games) * 100),
      kda: deaths === 0 ? kills + assists : ((kills + assists) / deaths).toFixed(2),
      avgKills: (kills / games).toFixed(1),
      avgDeaths: (deaths / games).toFixed(1),
      avgAssists: (assists / games).toFixed(1),
      avgCs: (cs / games).toFixed(1),
      csPerMin: (cs / (duration / 60)).toFixed(1),
      avgDmg: Math.round(damage / games).toLocaleString(),
    };
  }, [filteredMatches, puuid]);

  // --- 3. POBIERANIE RANGI (tylko jeśli nie "ALL") ---
  const currentRank = useMemo(() => {
    if (activeFilter === "ALL") return null; // Dla ALL nie szukamy rangi
    if (!leagueData) return null;
    if (activeFilter === "SOLO") return leagueData.find((l) => l.queueType === "RANKED_SOLO_5x5");
    if (activeFilter === "FLEX") return leagueData.find((l) => l.queueType === "RANKED_FLEX_SR");
    return null;
  }, [leagueData, activeFilter]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      {/* 1. ZAKŁADKI */}
      <QueueTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* 2. KONTENER DANYCH */}
      <div className="p-6">
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* KOLUMNA 1: WINRATE */}
            <WinRateChart
              wins={stats.wins}
              losses={stats.losses}
              games={stats.games}
              winrate={stats.winrate}
            />

            {/* KOLUMNY 2 i 3: STANDARDOWE STATYSTYKI */}
            <StatsDisplay
              kda={stats.kda}
              avgKills={stats.avgKills}
              avgDeaths={stats.avgDeaths}
              avgAssists={stats.avgAssists}
              avgCs={stats.avgCs}
              csPerMin={stats.csPerMin}
              avgDmg={stats.avgDmg}
            />

            {/* KOLUMNA 4: RANGA LUB DODATKOWE STATYSTYKI */}
            <div className="h-full flex items-center justify-center">
              {activeFilter === "ALL" ? (
                // Jeśli "Wszystkie" -> Pokaż Extra Stats
                <ExtraStats matches={filteredMatches} puuid={puuid} />
              ) : (
                // Jeśli Solo/Flex -> Pokaż Rangę
                <RankCard rankData={currentRank} />
              )}
              {}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <FaGamepad size={40} className="mb-3 opacity-20" />
            <p>
              Brak zagranych gier w trybie:{" "}
              <span className="font-bold text-slate-600">{QUEUE_FILTERS[activeFilter].label}</span>
            </p>
            <p className="text-xs mt-1">w ostatnich 20 meczach.</p>
          </div>
        )}
      </div>
    </div>
  );
};
