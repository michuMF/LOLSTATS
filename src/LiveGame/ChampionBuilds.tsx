// Upewnij się, że ten plik jest w tym samym folderze co PlayerDetailModal!
import { useEffect, useState, useMemo } from "react";
import { FaCrown, FaTrophy, FaUserAstronaut, FaFire } from "react-icons/fa";
import { fetchChampionRecommended } from "../api/fetchChampionRecommended";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { metaDataService } from "../services/metaData";
import { analyzeMeta } from "../utils/metaAnalysis";
import type { AnalysisResult } from "../utils/metaAnalysis";

// --- TYPY ---
interface OtpBuildData {
  playerName: string;
  playerRank: string;
  wins?: number;
  losses?: number;
  items: number[];
}

// --- FALLBACK GENERIC SETS ---
const GENERIC_SETS: Record<string, number[]> = {
  ADC_CRIT: [3006, 3031, 3046, 3036, 6672],
  ADC_ONHIT: [3006, 3124, 3091, 3153, 3085],
  MAGE_BURST: [3020, 6653, 4645, 3089, 3135],
  MAGE_CONTROL: [3158, 6655, 3116, 4637, 3089],
  AD_ASSASSIN: [3158, 6692, 3142, 6691, 3036],
  AP_ASSASSIN: [3020, 3152, 4645, 3100, 3089],
  BRUISER_AD: [3111, 3078, 3053, 6333, 3156],
  BRUISER_AP: [3111, 4633, 3157, 3089, 3135],
  TANK_ENGAGE: [3047, 3068, 3075, 8001, 3193],
  TANK_WARDEN: [3158, 3190, 3109, 3110, 3001],
  ENCHANTER: [3158, 6617, 3107, 2301, 3504],
  ENGAGE_SUPP: [3117, 3190, 3109, 3050, 3075],
};

const guessRole = (spell1: number, spell2: number): keyof typeof GENERIC_SETS => {
  const smite = 11;
  const heal = 7;
  const exhaust = 3;
  const ignite = 14;
  if (spell1 === smite || spell2 === smite) return "BRUISER_AD"; // Jungle zazwyczaj
  if (spell1 === heal || spell2 === heal) return "ADC_CRIT";
  if (spell1 === exhaust || spell2 === exhaust) return "ENGAGE_SUPP";
  if (spell1 === ignite || spell2 === ignite) return "MAGE_BURST";
  return "BRUISER_AD"; // Domyślny fallback
};

// --- KOMPONENT ---
interface ChampionBuildsProps {
  championId: number;
  spell1Id: number;
  spell2Id: number;
}

export const ChampionBuilds = ({ championId, spell1Id, spell2Id }: ChampionBuildsProps) => {
  const [items, setItems] = useState<number[]>([]);
  const [sourceType, setSourceType] = useState<"OTP" | "META" | "RIOT" | "FALLBACK">("FALLBACK");
  const [otpInfo, setOtpInfo] = useState<OtpBuildData | null>(null);
  const [metaInfo, setMetaInfo] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Używamy useMemo, żeby nie przeliczać roli przy każdym renderze
  const fallbackRole = useMemo(() => guessRole(spell1Id, spell2Id), [spell1Id, spell2Id]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setOtpInfo(null);
    setMetaInfo(null);
    setItems([]);

    // Improved logic with local variables
    const robustLoad = async () => {
      let foundItems: number[] = [];
      let type: "OTP" | "META" | "RIOT" | "FALLBACK" = "FALLBACK";

      // A. OTP
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/api/otp-build/${championId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length >= 3) {
            foundItems = data.items;
            type = "OTP";
            if (isMounted) {
              setOtpInfo(data);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load OTP data:", error);
      }

      // B. META
      try {
        // Zawsze pobieramy metę dla Run i Winrate
        const metaDataMap = await metaDataService.getChampionStats("CHALLENGER", championId);

        if (metaDataMap) {
          // Znajdź najpopularniejszą rolę (najwięcej meczów)
          let bestStats: any = null; // TODO: Use proper RoleStats type if imported
          let maxMatches = -1;

          Object.values(metaDataMap).forEach((stats) => {
            const m = stats.matches || 0;
            if (m > maxMatches) {
              maxMatches = m;
              bestStats = stats;
            }
          });

          if (bestStats) {
            const analysis = analyzeMeta(bestStats);
            if (isMounted) setMetaInfo(analysis);

            // Jeśli nie mamy itemów z OTP, bierzemy z Mety
            if (foundItems.length === 0 && analysis && analysis.coreItems.length > 0) {
              foundItems = analysis.coreItems.map((i) => Number(i.id));
              type = "META";
            }
          }
        }
      } catch (error) {
        console.error("Failed to load META data:", error);
      }

      // C. RIOT
      if (foundItems.length === 0) {
        try {
          const riotData = await fetchChampionRecommended(championId);
          const validBlock = riotData.find((b) => !b.title.toLowerCase().includes("starter"));
          if (validBlock && validBlock.itemIds.length > 0) {
            foundItems = validBlock.itemIds.slice(0, 6);
            type = "RIOT";
          }
        } catch (error) {
          console.error("Failed to load RIOT data:", error);
        }
      }

      // D. FALLBACK
      if (foundItems.length === 0) {
        foundItems = GENERIC_SETS[fallbackRole] || GENERIC_SETS["BRUISER_AD"];
        // type stays FALLBACK
      }

      if (isMounted) {
        setItems(foundItems);
        setSourceType(type);
        setLoading(false);
      }
    };

    robustLoad();
    return () => {
      isMounted = false;
    };
  }, [championId, fallbackRole]);

  if (loading)
    return (
      <div className="py-4 flex justify-center">
        <LoadingSpinner />
      </div>
    );

  // Obliczanie winrate
  let winrate = null;
  let winrateSource = "";

  if (otpInfo?.wins && otpInfo?.losses) {
    winrate = Math.round((otpInfo.wins / (otpInfo.wins + otpInfo.losses)) * 100);
    winrateSource = "OTP";
  } else if (metaInfo?.winRate) {
    winrate = Math.round(metaInfo.winRate);
    winrateSource = "META";
  }

  // Kolory tła
  const getBgClass = () => {
    switch (sourceType) {
      case "OTP":
        return "bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/40 shadow-xl shadow-yellow-900/10";
      case "META":
        return "bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/40 shadow-xl shadow-indigo-900/10";
      default:
        return "bg-slate-800/50 border-slate-700";
    }
  };

  return (
    <div
      className={`p-5 rounded-xl border mt-4 animate-fadeIn relative overflow-hidden transition-all ${getBgClass()}`}
    >
      {sourceType === "OTP" && (
        <div className="absolute -top-6 -right-6 text-yellow-500/5 rotate-12 pointer-events-none">
          <FaCrown size={140} />
        </div>
      )}
      {sourceType === "META" && (
        <div className="absolute -top-6 -right-6 text-indigo-500/5 rotate-12 pointer-events-none">
          <FaFire size={140} />
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {sourceType === "OTP" && <FaCrown className="text-yellow-400" />}
            {sourceType === "META" && <FaFire className="text-indigo-400" />}

            <h3
              className={`font-bold text-sm uppercase tracking-wider ${
                sourceType === "OTP"
                  ? "text-yellow-400"
                  : sourceType === "META"
                    ? "text-indigo-400"
                    : "text-slate-300"
              }`}
            >
              {sourceType === "OTP"
                ? "Challenger OTP Build"
                : sourceType === "META"
                  ? "Challenger Meta Build"
                  : "Recommended Build"}
            </h3>
          </div>

          <div className="flex flex-col gap-1">
            {/* OTP INFO */}
            {sourceType === "OTP" && otpInfo && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <FaUserAstronaut className="text-slate-400" />
                <span className="font-bold text-white">{otpInfo.playerName}</span>
                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] border border-yellow-500/30">
                  {otpInfo.playerRank}
                </span>
              </div>
            )}

            {/* WINRATE INFO */}
            {winrate !== null && (
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <FaTrophy
                  className={winrateSource === "OTP" ? "text-yellow-600" : "text-indigo-500"}
                />
                <span>
                  Winrate:{" "}
                  <span className={winrate > 55 ? "text-green-400" : "text-slate-300"}>
                    {winrate}%
                  </span>
                  {winrateSource === "OTP" ? (
                    <span className="opacity-50 mx-1">
                      ({otpInfo?.wins}W / {otpInfo?.losses}L)
                    </span>
                  ) : (
                    <span className="opacity-50 mx-1">({metaInfo?.matchesAnalyzed} Matches)</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RUNES & SPELLS DISPLAY (From META) */}
        {metaInfo && (
          <div className="flex gap-4">
            {/* SPELLS */}
            {metaInfo.spells.length > 0 && (
              <div className="flex gap-1 items-center bg-black/20 p-1.5 rounded-lg border border-white/5">
                {metaInfo.spells[0].ids.map((id) => (
                  <img
                    key={id}
                    src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/spell/Summoner${
                      id === 4
                        ? "Flash"
                        : id === 14
                          ? "Dot"
                          : id === 11
                            ? "Smite"
                            : id === 12
                              ? "Teleport"
                              : id === 6
                                ? "Haste"
                                : id === 7
                                  ? "Heal"
                                  : id === 3
                                    ? "Exhaust"
                                    : id === 21
                                      ? "Barrier"
                                      : id === 1
                                        ? "Boost"
                                        : "Flash" // Fallback naming logic needed properly
                      // Uproszczenie: mapping ID -> Nazwa pliku to spory słownik.
                      // Dla demo użyjemy placeholder lub prosty mapping w src/utils, ale tutaj
                      // spróbujemy trafić.
                    }.png`}
                    // Hack: DDragon wymaga nazw (SummonerFlash), a my mamy ID.
                    // W realnym app potrzebny util `spellIdToName`.
                    // Tutaj używamy generycznego fallbacku dla ikony jeśli URL padnie
                    onError={(e) => {
                      // Awaryjnie schowaj lub pokaż ikonę standardową
                      e.currentTarget.style.display = "none";
                    }}
                    className="w-8 h-8 rounded"
                    title={`Spell ID: ${id}`}
                  />
                ))}
              </div>
            )}

            {/* RUNES */}
            {metaInfo.runes.keystone && (
              <div className="flex gap-1 items-center bg-black/20 p-1.5 rounded-lg border border-white/5">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${
                    // To jest trudne, bo ścieżki do run są skomplikowane w DDragon.
                    // 8000 -> Precision -> ...
                    // ID -> Icon Path mapping jest w `runesRefforged.json`.
                    // Jeśli nie mamy tego, nie wyświetlimy obrazka łatwo.
                    // Placeholder for now.
                    metaInfo.runes.keystone.id
                  }.png`}
                  onError={(e) => {
                    // Fallback na tekst jak nie działa obrazek
                    e.currentTarget.style.display = "none";
                  }}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex flex-col text-[10px] leading-tight">
                  <span className="text-slate-300 font-bold">Rune</span>
                  <span className="text-slate-500">#{metaInfo.runes.keystone.id}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ITEMS */}
      <div className="flex flex-wrap gap-3 relative z-10">
        {items.map((itemId, idx) => (
          <div key={`${itemId}-${idx}`} className="group relative">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/item/${itemId}.png`}
              alt={`Item ${itemId}`}
              className={`w-12 h-12 rounded-lg border-2 transition-all cursor-help ${
                sourceType === "OTP"
                  ? "border-yellow-900/50 group-hover:border-yellow-400 group-hover:scale-110"
                  : sourceType === "META"
                    ? "border-indigo-900/50 group-hover:border-indigo-400 group-hover:scale-110"
                    : "border-slate-600 group-hover:border-slate-400"
              }`}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="absolute -bottom-2 -right-2 w-5 h-5 bg-slate-900 border border-slate-600 rounded-full text-[10px] flex items-center justify-center text-slate-400">
              {idx + 1}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
        <span>
          Based on:{" "}
          {sourceType === "OTP"
            ? "High Elo One-Trick"
            : sourceType === "META"
              ? "Challenger Aggregate"
              : sourceType === "RIOT"
                ? "Official Data"
                : "Standard Meta"}
        </span>
        {sourceType === "OTP" && (
          <span className="text-yellow-600/50 uppercase font-bold tracking-widest">
            Premium Data
          </span>
        )}
        {sourceType === "META" && (
          <span className="text-indigo-500/50 uppercase font-bold tracking-widest">Meta Data</span>
        )}
      </div>
    </div>
  );
};
