import { useState, useEffect, useMemo } from "react";
import { useDragonData } from "./useDragonData";
import type { MetaDatabase, ChampionBase } from "../types/meta";

const ORDERED_TIERS = [
  'ALL', 'CHALLENGER', 'GRANDMASTER', 'MASTER', 
  'DIAMOND', 'EMERALD', 'PLATINUM', 
  'GOLD', 'SILVER', 'BRONZE', 'IRON'
];

export const useMetaPageData = () => {
  const { version } = useDragonData();
  const [metaData, setMetaData] = useState<MetaDatabase | null>(null);
  const [champions, setChampions] = useState<ChampionBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych (równolegle)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Pobierz Postacie z DDragon (używając wersji z hooka)
        const champsReq = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/pl_PL/champion.json`);
        const champsJson = await champsReq.json();
        const champsList = Object.values(champsJson.data) as ChampionBase[];
        
        setChampions(champsList.sort((a, b) => a.name.localeCompare(b.name)));

        // 2. Importuj lokalny JSON (Lazy loading)
        // Zakładamy, że plik istnieje. Jeśli nie - złapiemy błąd.
        const metaModule = await import('../data/meta_data_v2.json');
        setMetaData(metaModule.default as unknown as MetaDatabase);

      } catch (err) {
        console.error("Meta Data Error:", err);
        setError("Brak danych analitycznych. Upewnij się, że backend wygenerował plik meta_data_v2.json.");
      } finally {
        setLoading(false);
      }
    };

    if (version) fetchData();
  }, [version]);

  // Dostępne rangi (na podstawie tego co jest w pliku)
  const availableTiers = useMemo(() => {
    if (!metaData) return [];
    const keys = Object.keys(metaData);
    return ORDERED_TIERS.filter(tier => tier === 'ALL' || keys.includes(tier));
  }, [metaData]);

  return {
    metaData,
    champions,
    availableTiers,
    loading,
    error,
    version
  };
};