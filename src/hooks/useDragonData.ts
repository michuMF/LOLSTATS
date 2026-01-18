// src/hooks/useDDragon.ts
import { useState, useEffect } from 'react';

export const useDDragon = () => {
  const [version, setVersion] = useState<string>("14.24.1"); // Fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        // Pytamy Riot o listę wersji
        const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        if (res.ok) {
           const versions = await res.json();
           // Pierwsza wersja w tablicy to najnowsza
           setVersion(versions[0]);
        }
      } catch (e) {
        console.warn("Nie udało się pobrać wersji DDragon, używam fallback.");
      } finally {
        setLoading(false);
      }
    };

    fetchVersion();
  }, []);

  return { version, loading };
};