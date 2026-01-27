import type { MetaDatabase, ChampionData } from "../types/meta";

let cachedData: MetaDatabase | null = null;

export const metaDataService = {
  async loadData(): Promise<MetaDatabase | null> {
    if (cachedData) return cachedData;

    try {
      // Lazy load dużego JSONA
      const data = await import("../data/meta_data_v2.json");
      // Import dynamiczny zwraca moduł, więc dobieramy się do defaulta lub zawartości
      cachedData = data.default as unknown as MetaDatabase;
      return cachedData;
    } catch (error) {
      console.error("Failed to load meta data:", error);
      return null;
    }
  },

  async getChampionStats(tier: string, championId: number): Promise<ChampionData | null> {
    const data = await this.loadData();
    if (!data) return null;

    const tierData = data[tier.toUpperCase()];
    if (!tierData) return null;

    return tierData[championId.toString()] || null;
  },
};
