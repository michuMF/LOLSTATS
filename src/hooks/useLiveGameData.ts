// src/hooks/useLiveGameData.ts
import { useState, useEffect } from "react";
import { fetchLiveGame } from "../api/fetchLiveGame";
import type { LiveGameDTO } from "../types/live-game";

export const useLiveGameData = (puuid: string | undefined, region: string) => {
  const [gameData, setGameData] = useState<LiveGameDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Domyślnie false, czekamy na PUUID
  const [error, setError] = useState<string | null>(null);
  const [isInGame, setIsInGame] = useState(false);

  useEffect(() => {
    // JEŚLI NIE MA PUUID, NIE RÓB NIC (czekamy na useSummonerData)
    if (!puuid || !region) {
      setGameData(null);
      setIsInGame(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchLiveGame(puuid, region);

        if (data) {
          setGameData(data);
          setIsInGame(true);
        } else {
          setGameData(null);
          setIsInGame(false); // To ważne - API zwróciło 404 = brak gry
        }
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas ładowania meczu.");
        // Opcjonalnie: jeśli błąd to 404, to po prostu nie ma gry, a nie błąd krytyczny
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [puuid, region]);

  return { gameData, isLoading, error, isInGame };
};
