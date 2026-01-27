import { useState, useEffect } from "react";
import { normalizeChampionName } from "../utils/championMapping";
import { ChampionDetailSchema, type ChampionDetailDTO } from "../types/champion"; // Zakładam, że masz ten plik z poprzednich kroków

export const useChampionPageData = (championName: string | undefined) => {
  const [champion, setChampion] = useState<ChampionDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Jeśli brak nazwy, przerywamy i wyłączamy loading
    if (!championName) {
      setError("Nie podano nazwy bohatera");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 2. Normalizacja nazwy (np. wukong -> MonkeyKing)
        const apiName = normalizeChampionName(championName);

        // Dynamiczna wersja (można pobierać z API, tu na sztywno dla bezpieczeństwa, lub użyj hooka useDragonData do wersji)
        const version = "14.1.1";

        const response = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${version}/data/pl_PL/champion/${apiName}.json`
        );

        if (!response.ok) {
          throw new Error(`Nie znaleziono bohatera: ${apiName} (Status: ${response.status})`);
        }

        const json = await response.json();
        const rawData = json.data[apiName]; // DDragon zwraca { data: { MonkeyKing: ... } }

        if (!rawData) {
          throw new Error("Pusty obiekt danych bohatera.");
        }

        // 3. Parsowanie Zod
        const parsed = ChampionDetailSchema.safeParse(rawData);

        if (!parsed.success) {
          console.warn("Błąd walidacji Zod (pokazuję mimo to):", parsed.error);
          // Fallback: pokazujemy dane mimo błędu walidacji (żeby user coś widział)
          setChampion(rawData as ChampionDetailDTO);
        } else {
          setChampion(parsed.data);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        // 4. Kluczowe: Zawsze wyłączamy loading na końcu!
        setLoading(false);
      }
    };

    fetchData();
  }, [championName]);

  return { champion, loading, error };
};
