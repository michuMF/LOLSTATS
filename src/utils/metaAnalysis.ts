// src/utils/metaAnalysis.ts

export interface ProcessedItem {
  id: string;
  pickRate: number;
  winRate: number;
  picks: number;
  score: number;
}

export interface ProcessedRune {
  id: string;
  pickRate: number;
  winRate: number;
  picks: number;
}

export interface ProcessedSpell {
  ids: number[]; // [Summoner1Id, Summoner2Id]
  pickRate: number;
  winRate: number;
  picks: number;
}

export interface AnalysisResult {
  matchesAnalyzed: number;
  winRate: number; // Global Winrate
  coreItems: ProcessedItem[];
  situationalItems: ProcessedItem[];
  runes: {
    keystone: ProcessedRune | null;
    secondaryTree: ProcessedRune | null;
  };
  spells: ProcessedSpell[];
}

interface RawBucket {
  picks: number;
  wins: number;
}

export interface RawStats {
  matches: number; // Zmiana z matchesAnalyzed na matches (zgodnie z V2)
  wins?: number; // Dodane wins globalne
  items: Record<string, RawBucket>;
  marketing?: {
    keystones: Record<string, RawBucket>;
    secondaryTrees: Record<string, RawBucket>;
    spells: Record<string, RawBucket>;
  };
}

const processBucket = (
  bucket: Record<string, RawBucket>,
  totalGames: number,
  minPickRate = 1.0
) => {
  return Object.entries(bucket)
    .map(([id, stats]) => {
      const pickRate = (stats.picks / totalGames) * 100;
      const winRate = stats.picks > 0 ? (stats.wins / stats.picks) * 100 : 0;
      return {
        id,
        pickRate: parseFloat(pickRate.toFixed(1)),
        winRate: parseFloat(winRate.toFixed(1)),
        picks: stats.picks,
        score: pickRate * winRate,
      };
    })
    .filter((i) => i.pickRate >= minPickRate)
    .sort((a, b) => b.picks - a.picks);
};

export const analyzeMeta = (rawStats: RawStats | null): AnalysisResult | null => {
  if (!rawStats || !rawStats.matches) return null;

  const totalGames = rawStats.matches;
  if (totalGames < 5) return null;

  // Global WR
  const globalWins = rawStats.wins || 0;
  const globalWR = (globalWins / totalGames) * 100;

  // 1. ITEMS
  const items = processBucket(rawStats.items, totalGames);

  const coreItems = items
    .filter((i) => i.pickRate > 15) // Podwyższony próg dla Core
    .slice(0, 6);

  const coreIds = new Set(coreItems.map((i) => i.id));

  const situationalItems = items
    .filter((i) => !coreIds.has(i.id))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10);

  // 2. RUNES
  let bestKeystone: ProcessedRune | null = null;
  let bestSecondary: ProcessedRune | null = null;

  if (rawStats.marketing) {
    const keystones = processBucket(rawStats.marketing.keystones, totalGames);
    if (keystones.length > 0) bestKeystone = keystones[0]; // Najpopularniejszy

    const secondaries = processBucket(rawStats.marketing.secondaryTrees, totalGames);
    if (secondaries.length > 0) bestSecondary = secondaries[0];
  }

  // 3. SPELLS
  const spells: ProcessedSpell[] = [];
  if (rawStats.marketing?.spells) {
    const rawSpells = processBucket(rawStats.marketing.spells, totalGames, 5.0); // Min 5% pickrate
    rawSpells.slice(0, 3).forEach((s) => {
      const [id1, id2] = s.id.split("_").map(Number);
      spells.push({
        ids: [id1, id2],
        pickRate: s.pickRate,
        winRate: s.winRate,
        picks: s.picks,
      });
    });
  }

  return {
    matchesAnalyzed: totalGames,
    winRate: parseFloat(globalWR.toFixed(1)),
    coreItems,
    situationalItems,
    runes: {
      keystone: bestKeystone,
      secondaryTree: bestSecondary,
    },
    spells,
  };
};
