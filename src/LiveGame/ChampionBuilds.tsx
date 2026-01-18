// src/LiveGame/ChampionBuilds.tsx

import { useEffect, useState } from "react";
import { FaCrown, FaUserAstronaut, FaRobot } from "react-icons/fa"; // Ikony źródła
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { fetchChampionRecommended, type RecommendedBlock } from "../api/fetchChampionRecommended";
import type { OtpDataset, OtpChampionData } from "../types/otp-types";

// --- FALLBACK GENERIC SETS ---
const GENERIC_SETS: Record<string, number[]> = {
  ADC_CRIT: [3006, 3031, 3046, 3036, 6672],
  ADC_ONHIT: [3006, 3124, 3091, 3153, 3085],
  MAGE_BURST: [3020, 6653, 4645, 3089, 3135],
  MAGE_CONTROL: [3158, 6655, 3116, 4637, 3089],
  AD_ASSASSIN: [3158, 6692, 3142, 6691, 3036],
  AP_ASSASSIN: [3020, 3152, 4645, 3100, 3089],
  BRUISER_AD: [3074, 3053, 3153, 6333, 3026],
  TANK: [3068, 3075, 3111, 3065, 3001],
  SUPPORT_ENCHANTER: [3157, 3504, 3174, 6617, 3003],
  SUPPORT_TANK: [3867, 3190, 3107, 3050, 3001],
};

interface ChampionBuildsProps {
  championId: number;
  role?: string; // np. "BOTTOM", "MIDDLE" (opcjonalne)
}

type SourceType = "OTP" | "RIOT" | "GENERIC";

export const ChampionBuilds = ({ championId, role }: ChampionBuildsProps) => {
  const [items, setItems] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  
  // Stan dla danych gracza PRO (jeśli źródło to OTP)
  const [otpPlayerInfo, setOtpPlayerInfo] = useState<OtpChampionData['player'] | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadBuilds = async () => {
      setLoading(true);
      setOtpPlayerInfo(null);

      try {
        // --- 1. PRÓBA: Dane OTP (Lokalny plik JSON) ---
        // Dynamiczny import - ładuje duży plik JSON tylko wtedy, gdy ten komponent jest renderowany
        try {
            // UWAGA: Upewnij się, że plik jest w src/data/
            const otpModule = await import("../data/otp_data_v4.json"); 
            const otpData = otpModule.default as unknown as OtpDataset;
            const champData = otpData[championId.toString()];

            if (champData && champData.build?.items?.length > 0) {
                if (isMounted) {
                    // Bierzemy 6 przedmiotów
                    setItems(champData.build.items.slice(0, 6));
                    setOtpPlayerInfo(champData.player);
                    setSourceType("OTP");
                    setLoading(false);
                }
                return; // Sukces, kończymy
            }
        } catch (err) {
            console.warn("Nie udało się załadować danych OTP:", err);
            // Nie przerywamy, idziemy do kroku 2
        }

        // --- 2. PRÓBA: API Riot / CommunityDragon ---
        const riotData: RecommendedBlock[] = await fetchChampionRecommended(championId);
        
        // Szukamy bloku, który NIE jest startowy (chcemy core build)
        // Prosta heurystyka: szukamy bloku, który ma najwięcej itemów albo specyficzne nazwy
        const coreBlock = riotData.find(b => 
            !b.title.toLowerCase().includes("starter") && 
            !b.title.toLowerCase().includes("consumable") &&
            b.itemIds.length >= 3
        );

        if (coreBlock && coreBlock.itemIds.length > 0) {
            if (isMounted) {
                setItems(coreBlock.itemIds.slice(0, 6));
                setSourceType("RIOT");
                setLoading(false);
            }
            return;
        }

      } catch (error) {
        console.error("Błąd pobierania buildów:", error);
      }

      // --- 3. FALLBACK: Zestawy generyczne ---
      // Proste mapowanie roli na klucz generic set
      let fallbackKey = "BRUISER_AD"; // Domyślny
      if (role) {
          if (role === "BOTTOM" || role === "ADC") fallbackKey = "ADC_CRIT";
          else if (role === "MIDDLE") fallbackKey = "MAGE_BURST";
          else if (role === "UTILITY" || role === "SUPPORT") fallbackKey = "SUPPORT_ENCHANTER";
          else if (role === "JUNGLE") fallbackKey = "BRUISER_AD";
          else if (role === "TOP") fallbackKey = "BRUISER_AD";
      }

      if (isMounted) {
        setItems(GENERIC_SETS[fallbackKey] || GENERIC_SETS["BRUISER_AD"]);
        setSourceType("GENERIC");
        setLoading(false);
      }
    };

    loadBuilds();

    return () => {
      isMounted = false;
    };
  }, [championId, role]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-black/40 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {sourceType === "OTP" && <FaCrown className="text-yellow-400" />}
          {sourceType === "RIOT" && <FaUserAstronaut className="text-blue-400" />}
          {sourceType === "GENERIC" && <FaRobot className="text-gray-400" />}
          
          {sourceType === "OTP" ? "Pro Build (OTP)" : "Rekomendowane"}
        </h3>
        
        {/* Wyświetlanie informacji o graczu OTP */}
        {sourceType === "OTP" && otpPlayerInfo && (
            <div className="text-xs text-right">
                <div className="text-yellow-200 font-semibold">{otpPlayerInfo.name}</div>
                <div className="text-white/60">{otpPlayerInfo.rank}</div>
            </div>
        )}
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {items.map((itemId, idx) => (
          <div key={`${itemId}-${idx}`} className="relative group">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/${itemId}.png`} // Warto zaktualizować wersję patcha dynamicznie
              alt={`Item ${itemId}`}
              className="w-12 h-12 rounded border border-white/20 hover:border-yellow-400 transition-colors"
              onError={(e) => {
                // Obsługa błędu obrazka (np. stary ID)
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Tooltip on hover logic could go here */}
          </div>
        ))}
      </div>
      
      {sourceType === "GENERIC" && (
          <p className="text-center text-xs text-gray-500 mt-2">Brak danych specyficznych, wyświetlam standardowy zestaw.</p>
      )}
    </div>
  );
};

export default ChampionBuilds;