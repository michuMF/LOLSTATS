import { useParams } from "react-router-dom";
import { useSummonerData } from "../hooks/useSummonerData";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { SearchBar } from "../SearchBar/SearchBar";
import { MatchList } from "../match/MatchList";
import { MatchSkeleton } from "../match/MatchSkeleton";
import { PlayerSummary } from "../Profile/SecondBlock/PlayerSummary";
import { PlayerMainPanel } from "../Profile/PlayerMainPanel";
import { ProfileHeader } from "../components/header/ProfileHeader";


export const ProfilePage = () => {
  const { region, gameName, tagLine } = useParams();
  const { summoner, ranked, matches, isLoading, error } = useSummonerData(gameName!, tagLine!, region!);
  const dataMatches = matches.data || [];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  if (error || summoner.isError || !summoner.data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <ErrorMessage message={`Nie znaleziono gracza ${gameName}#${tagLine} na serwerze ${region}.`} />
        <div className="mt-6"><SearchBar /></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full max-w-5xl mx-auto pt-6 pb-20">
      <ProfileHeader region={region!} gameName={gameName!} tagLine={tagLine!} />

      <div className="space-y-8">
        <PlayerMainPanel
          summoner={summoner.data}
          ranked={ranked.data}
          matches={dataMatches}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PlayerSummary
              matches={dataMatches}
              leagueData={ranked.data || null}
              puuid={summoner.data.puuid}
            />

            {matches.isLoading ? (
              <ul className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <MatchSkeleton key={i} />
                ))}
              </ul>
            ) : (
              <MatchList matchDetails={matches.data!} puuid={summoner.data.puuid} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};