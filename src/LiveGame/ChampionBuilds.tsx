import { useEffect, useState, useMemo } from "react";

import { FaCrown, FaTrophy, FaUserAstronaut } from "react-icons/fa"; // Upewnij się, że masz react-icons
import { fetchChampionRecommended } from "../api/fetchChampionRecommended";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

// --- TYPY ---
interface OtpBuildData {
  playerName: string;
  playerRank: string;
  wins?: number;
  losses?: number;
  items: number[];
}

// --- FALLBACK GENERIC SETS (Te co miałeś wcześniej) ---
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
  if (spell1 === smite || spell2 === smite) return "BRUISER_AD";
  if (spell1 === heal || spell2 === heal) return "ADC_CRIT";
  if (spell1 === exhaust || spell2 === exhaust) return "ENGAGE_SUPP";
  if (spell1 === ignite || spell2 === ignite) return "MAGE_BURST";
  return "BRUISER_AD";
};

// --- KOMPONENT ---
interface ChampionBuildsProps {
  championId: number;
  spell1Id: number;
  spell2Id: number;
}

export const ChampionBuilds = ({ championId, spell1Id, spell2Id }: ChampionBuildsProps) => {
  const [items, setItems] = useState<number[]>([]);
  const [sourceType, setSourceType] = useState<"OTP" | "RIOT" | "FALLBACK">("FALLBACK");
  const [otpInfo, setOtpInfo] = useState<OtpBuildData | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackRole = useMemo(() => guessRole(spell1Id, spell2Id), [spell1Id, spell2Id]);

  useEffect(() => {
    setLoading(true);
    setOtpInfo(null);
    setItems([]);

    const loadBuild = async () => {
      if (!championId) { setLoading(false); return; }

      // 1. PRÓBA OTP (Twój Backend)
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/otp-build/${championId}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length >= 3) {
            setItems(data.items);
            setOtpInfo(data);
            setSourceType("OTP");
            setLoading(false);
            return; // Sukces! Kończymy.
          }
        }
      } catch (e) {
        console.warn("Brak danych OTP, fallback...");
      }

      // 2. PRÓBA RIOT (CommunityDragon)
      try {
        const riotData = await fetchChampionRecommended(championId);
        const validBlock = riotData.find(b => {
             const t = b.title.toLowerCase(); 
             return !t.includes("starter") && !t.includes("consumable");
        });

        if (validBlock && validBlock.itemIds.length > 0) {
          setItems(validBlock.itemIds.slice(0, 6));
          setSourceType("RIOT");
          setLoading(false);
          return;
        }
      } catch (e) {}

      // 3. FALLBACK (Generic)
      setItems(GENERIC_SETS[fallbackRole] || GENERIC_SETS["BRUISER_AD"]);
      setSourceType("FALLBACK");
      setLoading(false);
    };

    loadBuild();
  }, [championId, fallbackRole]);

  if (loading) return <div className="py-4 flex justify-center"><LoadingSpinner /></div>;

  // Obliczanie Winrate gracza (jeśli dostępne)
  const winrate = otpInfo?.wins && otpInfo?.losses 
    ? Math.round((otpInfo.wins / (otpInfo.wins + otpInfo.losses)) * 100) 
    : null;

  return (
    <div className={`p-5 rounded-xl border mt-4 animate-fadeIn relative overflow-hidden transition-all ${
        sourceType === "OTP" 
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/40 shadow-xl shadow-yellow-900/10" 
            : "bg-slate-800/50 border-slate-700"
    }`}>
      
      {/* Tło ozdobne dla OTP */}
      {sourceType === "OTP" && (
          <div className="absolute -top-6 -right-6 text-yellow-500/5 rotate-12 pointer-events-none">
              <FaCrown size={140} />
          </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
                {sourceType === "OTP" && <FaCrown className="text-yellow-400" />}
                <h3 className={`font-bold text-sm uppercase tracking-wider ${
                    sourceType === "OTP" ? "text-yellow-400" : "text-slate-300"
                }`}>
                    {sourceType === "OTP" ? "Challenger Build" : "Recommended Build"}
                </h3>
            </div>
            
            {/* Informacje o graczu (tylko dla OTP) */}
            {sourceType === "OTP" && otpInfo && (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <FaUserAstronaut className="text-slate-400"/>
                        <span className="font-bold text-white">{otpInfo.playerName}</span>
                        <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] border border-yellow-500/30">
                            {otpInfo.playerRank}
                        </span>
                    </div>
                    {winrate && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                           <FaTrophy className="text-yellow-600"/> 
                           <span>Winrate: <span className={winrate > 55 ? "text-green-400" : "text-slate-300"}>{winrate}%</span> 
                           <span className="opacity-50 mx-1">({otpInfo.wins}W / {otpInfo.losses}L)</span></span>
                        </div>
                    )}
                </div>
            )}
          </div>
      </div>
      
      {/* LISTA ITEMÓW */}
      <div className="flex flex-wrap gap-3 relative z-10">
        {items.map((itemId, idx) => (
            <div key={`${itemId}-${idx}`} className="group relative">
                <img 
                    src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/item/${itemId}.png`}
                    alt={`Item ${itemId}`}
                    className={`w-12 h-12 rounded-lg border-2 transition-all cursor-help ${
                        sourceType === "OTP" 
                            ? 'border-yellow-900/50 group-hover:border-yellow-400 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-yellow-500/20' 
                            : 'border-slate-600 group-hover:border-slate-400'
                    }`}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                {/* Kolejność zakupu (indeks + 1) */}
                <span className="absolute -bottom-2 -right-2 w-5 h-5 bg-slate-900 border border-slate-600 rounded-full text-[10px] flex items-center justify-center text-slate-400">
                    {idx + 1}
                </span>
            </div>
        ))}
      </div>
      
      {/* STOPKA */}
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
        <span>Based on: {sourceType === "OTP" ? "High Elo Analysis" : sourceType === "RIOT" ? "Official Data" : "Standard Meta"}</span>
        {sourceType === "OTP" && <span className="text-yellow-600/50 uppercase font-bold tracking-widest">Premium Data</span>}
      </div>
    </div>
  );
};