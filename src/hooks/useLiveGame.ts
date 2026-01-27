// src/hooks/useLiveGame.ts
import { useState, useEffect } from "react";
import { fetchLiveGame, type LiveGameDTO } from "../api/fetchLiveGame";

export const useLiveGame = (puuid: string | undefined, region: string | undefined) => {
  const [game, setGame] = useState<LiveGameDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Resetuj stan przy zmianie parametrów
    setGame(null);
    setError(null);

    if (!puuid || !region) return;

    const loadGame = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLiveGame(puuid, region);
        if (!data) {
          setError("Gracz nie jest aktualnie w grze.");
        } else {
          setGame(data);
        }
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać danych meczu.");
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [puuid, region]);

  return { game, isLoading, error };
};
