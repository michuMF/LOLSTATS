import { useParams, Link } from "react-router-dom";
import { useSummonerData } from "../hooks/useSummonerData"; 
import { useLiveGameData } from "../hooks/useLiveGameData";
import { useDragonData } from "../hooks/useDragonData";
import { LiveGameHeader } from "../components/live-game/LiveGameHeader";
import { ParticipantCard } from "../components/live-game/ParticipantCard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { SearchBar } from "../SearchBar/SearchBar";

export const LiveGamePage = () => {
  const { region, gameName, tagLine } = useParams();
  
  // 1. Pobieramy PUUID gracza
  const { summoner, isLoading: isSummonerLoading, error: summonerError } = useSummonerData(gameName!, tagLine!, region!);
  const puuid = summoner.data?.puuid;

  // 2. Pobieramy Mecz (Hook useLiveGameData NIE powinien już pobierać rang, tylko sam mecz!)
  const { gameData, isLoading: isGameLoading, error: gameError, isInGame } = useLiveGameData(puuid, region!);

  // 3. Dane statyczne (Obrazki)
  const { getChampionName, getSpellId, getRuneIcon, version, loading: isDragonLoading } = useDragonData();

  const isLoading = isSummonerLoading || (!!puuid && isGameLoading) || isDragonLoading;

  if (summonerError || (summoner.isError && !isSummonerLoading)) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
         <ErrorMessage message={`Nie znaleziono gracza ${gameName}#${tagLine}.`} />
         <div className="w-96"><SearchBar /></div>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  if (gameError || !gameData) {
     return (
       <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{gameName}#{tagLine}</h2>
            <p className="text-slate-500 text-lg">
                {!isInGame ? "Ten gracz nie jest aktualnie w grze." : "Nie udało się pobrać danych meczu."}
            </p>
          </div>
          <div className="w-96"><SearchBar /></div>
          <Link to={`/profile/${region}/${gameName}/${tagLine}`} className="text-blue-600 font-semibold hover:underline">
            Wróć do profilu
          </Link>
       </div>
     );
  }

  const blueTeam = gameData.participants.filter(p => p.teamId === 100);
  const redTeam = gameData.participants.filter(p => p.teamId === 200);

  return (
    <div className="animate-fadeIn w-full max-w-7xl mx-auto pt-6 pb-20 px-4">
       <div className="flex justify-between items-center mb-6">
        <Link to="/" className="text-2xl font-black text-slate-800">LOL<span className="text-blue-600">STATS</span></Link>
        <div className="w-96 hidden md:block"><SearchBar /></div>
      </div>

      <LiveGameHeader game={gameData} getChampionName={getChampionName} version={version} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
         <div className="hidden lg:flex absolute left-1/2 top-10 -translate-x-1/2 w-12 h-12 bg-slate-800 rounded-full items-center justify-center text-white font-black z-10 border-4 border-white shadow-lg">VS</div>

         <div className="space-y-4">
            <h3 className="text-blue-600 font-bold text-xl mb-4 border-b-2 border-blue-100 pb-2">Blue Team</h3>
            {blueTeam.map((p, idx) => (
                <ParticipantCard 
                    key={p.puuid || `blue-${idx}`} 
                    participant={p} isBlueTeam={true} region={region!}
                    championName={getChampionName(p.championId)}
                    getSpellId={getSpellId} getRuneIcon={getRuneIcon} version={version}
                />
            ))}
         </div>

         <div className="space-y-4">
            <h3 className="text-red-500 font-bold text-xl mb-4 text-right border-b-2 border-red-100 pb-2">Red Team</h3>
            {redTeam.map((p, idx) => (
                <ParticipantCard 
                    key={p.puuid || `red-${idx}`} 
                    participant={p} isBlueTeam={false} region={region!}
                    championName={getChampionName(p.championId)}
                    getSpellId={getSpellId} getRuneIcon={getRuneIcon} version={version}
                />
            ))}
         </div>
      </div>
    </div>
  );
};