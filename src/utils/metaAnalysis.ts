// src/utils/metaAnalysis.ts

export interface ProcessedItem {
  id: string;
  pickRate: number;
  winRate: number;
  picks: number;
  score: number;
}

// Definiujemy dokładnie co zwracamy, żeby TS nie zgadywał
export interface AnalysisResult {
  matchesAnalyzed: number;
  coreItems: ProcessedItem[];
  winningItems: ProcessedItem[];
}

export const analyzeMeta = (rawStats: any): AnalysisResult | null => {
  // FIX 1: Jeśli brak danych, zwracamy null (nie []), żeby "if (!analysis)" w komponencie zadziałało
  if (!rawStats || !rawStats.matchesAnalyzed) return null;

  const totalGames = rawStats.matchesAnalyzed;
  
  // Opcjonalnie: Ignoruj małe próbki
  if (totalGames < 5) return null;

  // Konwersja obiektu items na tablicę
  const items: ProcessedItem[] = Object.entries(rawStats.items).map(([itemId, stats]: [string, any]) => {
    const pickRate = (stats.picks / totalGames) * 100;
    const winRate = stats.picks > 0 ? (stats.wins / stats.picks) * 100 : 0;

    return {
      id: itemId,
      pickRate: parseFloat(pickRate.toFixed(1)),
      winRate: parseFloat(winRate.toFixed(1)),
      picks: stats.picks,
      score: pickRate * winRate 
    };
  });

  // FILTROWANIE

  // 1. Core Items (Najpopularniejsze)
  const coreItems = items
    .filter(i => i.pickRate > 15) // Musi być popularny
    .sort((a, b) => b.picks - a.picks)
    .slice(0, 6);

  // 2. Winning Items (Wysokie Winrate)
  const winningItems = items
    .filter(i => i.pickRate > 5 && i.winRate > 50) // Przynajmniej 5% pick rate i dodatnie WR
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 4);

  // FIX 2: Zwracamy obiekt z nazwami kluczy, których oczekuje ChampionsPage.tsx
  return {
    matchesAnalyzed: totalGames,
    coreItems: coreItems,       // Komponent szuka .coreItems
    winningItems: winningItems  // Komponent szuka .winningItems
  };
};