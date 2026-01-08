import { useSummonerData } from "../hooks/useSummonerData";
import { SummonerDetails } from "./SummonerDetails";
import { RankedData } from "./RankedData";
import { MatchList } from "../match/MatchList";
import { PlayerSummary } from "./PlayerSummary"; // <-- Importujemy Twój komponent!

// Jeśli nie masz tych komponentów, możesz je zakomentować lub podmienić na <div>
import { LoadingSpinner } from "../components/ui/LoadingSpinner"; 
import { ErrorMessage } from "../components/ui/ErrorMessage"; 

interface SummonerProfileProps {
  gameName: string;
  tagLine: string;
  region: string;
}

export const SummonerProfile = ({ gameName, tagLine, region }: SummonerProfileProps) => {
  const { account, summoner, ranked, matches, isLoading, error } = useSummonerData(
    gameName,
    tagLine,
    region
  );

  if (isLoading) return <div className="flex justify-center p-10"><LoadingSpinner /></div>;
  if (error) return <div className="flex justify-center p-10"><ErrorMessage message={error instanceof Error ? error.message : "Error"} /></div>;
  if (!account.data || !summoner.data) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* 1. HEADER (TOŻSAMOŚĆ) */}
      <SummonerDetails
        summoner={summoner.data}
        ranked={ranked.data}
        gameName={account.data.gameName}
        tagLine={account.data.tagLine}
      />

      {/* 2. STATS DASHBOARD (TO CO CHCIAŁEŚ) */}
      {/* Wyświetlamy tylko jeśli są mecze */}
      {matches.data && matches.data.length > 0 && (
        <PlayerSummary 
            matches={matches.data} 
            leagueData={ranked.data || []} // PlayerSummary wymaga tablicy, nawet pustej
            puuid={account.data.puuid}
        />
      )}

      {/* 3. GRID (SZCZEGÓŁOWE RANGI + HISTORIA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEWA KOLUMNA: Wszystkie Rangi */}
        <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-slate-800 rounded-full"></span>
                Ranked Queues
            </h3>
            <RankedData rankedData={ranked.data || []} />
        </div>

        {/* PRAWA KOLUMNA: Historia Meczów */}
        <div className="lg:col-span-2">
           <MatchList 
              matchDetails={matches.data} 
              puuid={account.data.puuid} 
           />
        </div>
      </div>
    </div>
  );
};