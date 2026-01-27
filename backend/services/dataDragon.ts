// backend/services/dataDragon.ts
export const ITEM_MAP: Record<string, string> = {};
export const RUNE_MAP: Record<number, string> = {};
export const CHAMPION_TAGS: Record<string, string[]> = {};
export let IS_READY = false;

interface DDItemData {
  data: Record<string, { name: string }>;
}

interface DDRune {
  id: number;
  name: string;
}

interface DDRuneSlot {
  runes: DDRune[];
}

interface DDRuneTree {
  id: number;
  name: string;
  slots: DDRuneSlot[];
}

interface DDChampionData {
  data: Record<string, { name: string; tags: string[] }>;
}

export const initializeDataDragon = async () => {
  try {
    console.log("⏳ [1/4] Data Dragon: Sprawdzanie wersji...");
    const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions = (await versionRes.json()) as string[];
    const v = versions[0];
    console.log(`✅ Wykryto patch: ${v}`);

    console.log("⏳ [2/4] Data Dragon: Nauka przedmiotów...");
    const itemsRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${v}/data/pl_PL/item.json`
    );
    const itemsData = (await itemsRes.json()) as DDItemData;
    Object.keys(itemsData.data).forEach((id) => {
      ITEM_MAP[id] = itemsData.data[id].name;
    });

    console.log("⏳ [3/4] Data Dragon: Nauka run...");
    const runesRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${v}/data/pl_PL/runesReforged.json`
    );
    const runesData = (await runesRes.json()) as DDRuneTree[];
    runesData.forEach((tree) => {
      RUNE_MAP[tree.id] = tree.name;
      tree.slots.forEach((slot) => {
        slot.runes.forEach((rune) => {
          RUNE_MAP[rune.id] = rune.name;
        });
      });
    });

    console.log("⏳ [4/4] Data Dragon: Analiza bohaterów...");
    const champRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${v}/data/en_US/champion.json`
    );
    const champData = (await champRes.json()) as DDChampionData;
    Object.values(champData.data).forEach((champ) => {
      CHAMPION_TAGS[champ.name] = champ.tags;
    });

    IS_READY = true;
    console.log(`🚀 BAZA GOTOWA. System Zod uzbrojony.`);
  } catch (error) {
    console.error("❌ Błąd Data Dragon:", error);
    IS_READY = true;
  }
};
