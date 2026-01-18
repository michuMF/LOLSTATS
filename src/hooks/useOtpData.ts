// src/hooks/useOtpData.ts
import { useState, useEffect } from 'react';
import type { OtpDataset } from '../types/otp-types'; // Upewnij się, że masz ten typ z poprzedniego kroku

export const useOtpData = () => {
  const [data, setData] = useState<OtpDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Dynamiczny import dla code-splittingu
        // Zakładamy, że plik jest w src/data/otp_data_v4.json
        const module = await import('../data/otp_data_v4.json');
        
        if (isMounted) {
          // Rzutowanie, bo import JSON w TS bywa traktowany jako ogólny obiekt
          setData(module.default as unknown as OtpDataset);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load OTP data", err);
          setError(err);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper function do pobierania konkretnego championa
  const getChampionData = (championId: number | string) => {
    if (!data) return null;
    return data[championId.toString()];
  };

  return { data, loading, error, getChampionData };
};