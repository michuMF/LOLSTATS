import { useSummonerData } from "../hooks/useSummonerData";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { SummonerDetails } from "./SummonerDetails";
import { RankedData } from "./RankedData";
import { MatchHistory } from "./MatchHistory";
import type { SummonerBasicInfoType } from "../types/types";



export const SummonerProfile = ({ gameName, tagLine }: SummonerBasicInfoType) => {
  // Używamy naszego hooka - jedna linijka zamiast 50!
  const { summoner, ranked, matches, isLoading, error } = useSummonerData(gameName, tagLine);

  // 1. Obsługa stanu ładowania (jeśli główne dane się ładują)
  if (isLoading && !summoner.data) {
    return <LoadingSpinner />;
  }

  // 2. Obsługa błędów
  if (error || (summoner.isError)) {
    return (
        <ErrorMessage 
            message={error?.message || "Nie udało się znaleźć przywoływacza. Sprawdź Riot ID."} 
            retry={() => summoner.refetch()}
        />
    );
  }

  // Jeśli nie ma danych po załadowaniu
  if (!summoner.data) return null;

  return (
    <div className="animate-fadeIn">
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

      {/* Rangi - ładują się niezależnie, możemy pokazać spinner lokalnie jeśli chcemy, 
          ale tutaj React Query obsłuży to płynnie */}
      {ranked.isLoading ? (
         <div className="py-4 text-center text-gray-500">Ładowanie rang...</div>
      ) : (
         <RankedData rankedData={ranked.data || []} />
      )}

      {/* Historia Meczów */}
      {matches.isLoading ? (
          <div className="mt-8">
             <LoadingSpinner />
             <p className="text-center text-sm text-gray-400 mt-2">Analizowanie historii gier...</p>
          </div>
      ) : (
         matches.isError ? (
             <div className="mt-8 p-4 bg-red-50 text-red-600 rounded">Nie udało się pobrać historii gier.</div>
         ) : (
            <MatchHistory matchDetails={matches.data || []} puuid={summoner.data.puuid} />
         )
      )}
    </div>
  );
};