// src/hooks/useChampionsList.ts
import { useState, useEffect } from 'react';

// Typy dla DDragon Champion List
interface ChampionBasicInfo {
  id: string; // To jest "klucz" nazwy np. "Aatrox"
  key: string; // To jest ID numeryczne jako string np. "266"
  name: string;
  title: string;
  image: {
    full: string;
  };
  tags: string[];
}

interface DDragonResponse {
  data: Record<string, ChampionBasicInfo>;
}

export const useChampionsList = () => {
  const [champions, setChampions] = useState<ChampionBasicInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChamps = async () => {
      try {
        // Pobieramy najnowsze dane. W produkcji warto cachować ten request.
        // Używamy wersji hardcoded lub dynamicznej.
        const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.24.1/data/en_US/champion.json');
        const json = (await response.json()) as DDragonResponse;
        
        // Konwertujemy obiekt na tablicę dla łatwiejszego mapowania
        const championsArray = Object.values(json.data);
        
        // Sortujemy alfabetycznie
        championsArray.sort((a, b) => a.name.localeCompare(b.name));
        
        setChampions(championsArray);
      } catch (error) {
        console.error("Failed to fetch champion list", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChamps();
  }, []);

  return { champions, loading };
};