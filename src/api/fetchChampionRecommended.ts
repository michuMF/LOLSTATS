// src/api/fetchChampionRecommended.ts

// --- TYPE ---
export interface RecommendedBlock {
    title: string;
    itemIds: number[];
}

export const fetchChampionRecommended = async (championId: number): Promise<RecommendedBlock[]> => {
  const url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${championId}.json`;
  
  console.log(`🔍 [CDragon] Fetching builds for ChampID: ${championId} from ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ [CDragon] Failed to fetch. Status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log("📦 [CDragon] Raw Data:", data); // Odkomentuj, jeśli chcesz widzieć cały JSON

    // Sprawdzamy czy istnieje tablica itemSets
    const itemSets = data.itemSets || [];
    
    if (itemSets.length === 0) {
      console.warn(`⚠️ [CDragon] No 'itemSets' found for champion ${championId}.`);
      return [];
    }

    // Szukamy zestawu, który pasuje do Summoner's Rift (mapId 11) lub bierzemy pierwszy
    // Riot często wrzuca tu zestawy dla map 11 (SR) i 12 (ARAM)
    const srItemSet = itemSets.find((set: any) => 
        set.associatedMaps && set.associatedMaps.includes(11)
    ) || itemSets[0];

    const blocks = srItemSet.blocks || [];

    if (blocks.length === 0) {
       console.warn(`⚠️ [CDragon] Item set found but 'blocks' array is empty.`);
       return [];
    }

    const result = blocks.map((block: any) => ({
      title: block.type || "Recommended",
      // Parsujemy ID i filtrujemy błędne (NaN)
      itemIds: block.items
        .map((item: any) => parseInt(item.id))
        .filter((id: number) => !isNaN(id)) 
    }));

    console.log(`✅ [CDragon] Parsed ${result.length} blocks successfully.`);
    return result;

  } catch (error) {
    console.error("❌ [CDragon] Error fetching recommended items:", error);
    return [];
  }
};