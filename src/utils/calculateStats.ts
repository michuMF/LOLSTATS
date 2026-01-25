// src/utils/calculateStats.ts

import type { MatchDetailsType, ParticipantType } from "../api/fetchMatchDetails";




export interface ChampionStats {
  championName: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
}

export interface PlayerSummaryStats {
  totalGames: number;
  winRate: number;
  avgKda: string;
  avgCs: number;
  topChampions: ChampionStats[];
  preferredRole: string;
}

export const calculatePlayerStats = (matches: MatchDetailsType[], puuid: string): PlayerSummaryStats => {
  let totalWins = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalCs = 0;
  
  const championMap = new Map<string, ChampionStats>();
  const roleMap = new Map<string, number>();

  matches.forEach((match) => {
    // W Twoim typie MatchDTO dostęp do uczestników jest przez match.info.participants
    const participant: ParticipantType | undefined = match.info.participants.find((p) => p.puuid === puuid);
    if (!participant) return;

    // Statystyki ogólne
    if (participant.win) totalWins++;
    totalKills += participant.kills;
    totalDeaths += participant.deaths;
    totalAssists += participant.assists;
    
    // Suma minionów (lane + jungle)
    totalCs += participant.totalMinionsKilled + participant.neutralMinionsKilled;

    // Statystyki ról (pozycji)
    const role = participant.teamPosition || "UNKNOWN";
    roleMap.set(role, (roleMap.get(role) || 0) + 1);

    // Statystyki bohaterów
    const champName = participant.championName;
    if (!championMap.has(champName)) {
      championMap.set(champName, {
        championName: champName,
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        cs: 0,
      });
    }

    const champStats = championMap.get(champName)!;
    champStats.games++;
    if (participant.win) champStats.wins++;
    champStats.kills += participant.kills;
    champStats.deaths += participant.deaths;
    champStats.assists += participant.assists;
    champStats.cs += participant.totalMinionsKilled + participant.neutralMinionsKilled;
  });

  // Sortowanie najlepszych postaci (według liczby gier)
  const sortedChampions = Array.from(championMap.values())
    .sort((a, b) => b.games - a.games)
    .slice(0, 3);

  // Znalezienie głównej roli
  let bestRole = "FLEX";
  let maxRoleCount = 0;
  roleMap.forEach((count, role) => {
    if (count > maxRoleCount) {
      maxRoleCount = count;
      bestRole = role;
    }
  });

  const totalGames = matches.length;
  if (totalGames === 0) {
    return { totalGames: 0, winRate: 0, avgKda: "0.0", avgCs: 0, topChampions: [], preferredRole: "None" };
  }

  return {
    totalGames,
    winRate: Math.round((totalWins / totalGames) * 100),
    avgKda: ((totalKills + totalAssists) / Math.max(1, totalDeaths)).toFixed(2),
    avgCs: Math.round(totalCs / totalGames),
    topChampions: sortedChampions,
    preferredRole: bestRole,
  };
};


export const formatDuration = (seconds: number): string => {
  if (seconds < 0) return "00:00";
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');

  if (h > 0) {
    return `${h}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
};