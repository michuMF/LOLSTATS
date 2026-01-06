import { useSummonerData } from "../hooks/useSummonerData";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { SummonerDetails } from "./SummonerDetails";
import { RankedData } from "./RankedData";
import { MatchHistory } from "./MatchHistory";
import type { SummonerBasicInfoType } from "../types/types";

// Definiujemy propsy, dodając region (bo SummonerBasicInfoType go nie ma)
interface SummonerProfileProps extends Partial<SummonerBasicInfoType> {
  gameName: string;
  tagLine: string;
  region: string; // <--- NOWE POLE
}

export const SummonerProfile = ({ gameName, tagLine, region }: SummonerProfileProps) => {
  
  // ✅ TERAZ PRZEKAZUJEMY REGION DO HOOKA (3 argument)
  const { summoner, ranked, matches, isLoading, error } = useSummonerData(gameName, tagLine, region);

  // 1. Obsługa stanu ładowania
  if (isLoading && !summoner.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="text-slate-500 mt-4 animate-pulse">Przeszukiwanie serwera {region}...</p>
      </div>
    );
  }

  // 2. Obsługa błędów
  if (error || (summoner.isError)) {
    return (
        <ErrorMessage 
            message={error?.message || `Nie udało się znaleźć gracza ${gameName}#${tagLine} w regionie ${region}.`} 
            retry={() => summoner.refetch()}
        />
    );
  }

  if (!summoner.data) return null;

  return (
    <div className="animate-fadeIn space-y-8">
      
      {/* Podstawowe Info */}
      <SummonerDetails
        summonerData={{
            gameName: summoner.data.gameName,
            tagLine: summoner.data.tagLine,
            puuid: summoner.data.puuid,
            summonerLevel: summoner.data.summonerLevel,
            profileIconId: summoner.data.profileIconId,
        }}
      />

      {/* Grid dla Rang i Historii */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
          
          {/* LEWA KOLUMNA: Historia Meczów */}
          <div className="lg:col-span-2 ">
              {matches.isLoading ? (
                  <div className="py-10 flex flex-col items-center">
                     <LoadingSpinner />
                     <p className="text-sm text-slate-400 mt-2">Analiza AI w toku...</p>
                  </div>
              ) : matches.isError ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200">
                      Błąd pobierania historii gier.
                  </div>
              ) : (
                 <MatchHistory matchDetails={matches.data || []} puuid={summoner.data.puuid} />
              )}
          </div>

          {/* PRAWA KOLUMNA: Rangi */}
          <div className="lg:col-span-1">
              {ranked.isLoading ? (
                 <div className="py-4 text-center text-slate-500">Ładowanie rang...</div>
              ) : (
                 <RankedData rankedData={ranked.data || []} />
              )}
          </div>
      </div>
    </div>
  );
};