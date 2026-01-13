import { Link, useParams } from "react-router-dom";
import { useSummonerData } from "../hooks/useSummonerData";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { SearchBar } from "../SearchBar/SearchBar";
// import { SummonerDetails } from "../SearchBar/SummonerDetails";


import { RankedData } from "../SearchBar/RankedData";
import { MatchList } from "../match/MatchList";
import { PlayerSummary } from "../SearchBar/PlayerSummary";
import { PlayerMainPanel } from "../ProfilePageComponents/PlayerMainPanel";

import { fetchLiveGame } from "../api/fetchLiveGame";
import { useState } from "react";


export const ProfilePage = () => {

const [liveGame, setLiveGame] = useState<any>(null);
const [loadingLive, setLoadingLive] = useState(false);
const [liveMsg, setLiveMsg] = useState("");

const checkLiveGame = async () => {
    if (!summoner.data) return;
    setLoadingLive(true);
    setLiveMsg("");
    try {
        const data = await fetchLiveGame(summoner.data.puuid, region!);
        if (data) {
            setLiveGame(data);
        } else {
            setLiveMsg("Gracz nie jest obecnie w grze.");
            setLiveGame(null);
        }
    } catch (e) {
        setLiveMsg("Błąd podczas sprawdzania.");
    } finally {
        setLoadingLive(false);
    }
};


  // Pobieramy region z URL
  const { region, gameName, tagLine } = useParams(); 
  
  // Przekazujemy region do hooka
  const { summoner, ranked, matches, isLoading, error } = useSummonerData(gameName!, tagLine!, region!);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  
  if (error || (summoner.isError)) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
         <ErrorMessage message={`Nie znaleziono gracza ${gameName}#${tagLine} na serwerze ${region}.`} />
         <div className="mt-6"><SearchBar /></div>
      </div>
    );
  }

  if (!summoner.data) return null;

  return (
    <div className="animate-fadeIn w-full max-w-5xl mx-auto pt-6 pb-20">
      {/* Navbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-slate-200 pb-6">
        <Link to="/" className="text-3xl font-black text-slate-800 hover:text-blue-600 transition">
          LOL<span className="text-blue-600">STATS</span>
        </Link>
        <div className="w-full md:w-auto">
          <SearchBar />
        </div>
        <button 
    onClick={checkLiveGame} 
    className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
>
    {loadingLive ? "Sprawdzanie..." : "🔴 LIVE GAME"}
</button>

{liveMsg && <p className="text-sm text-slate-500 mt-2">{liveMsg}</p>}

{liveGame && (
    <div className="mt-4 p-4 bg-slate-800 text-white rounded-lg">
        <h3 className="font-bold text-lg text-yellow-400">W GRZE: {liveGame.gameMode}</h3>
        <p>Czas gry: {Math.floor(liveGame.gameLength / 60)} min</p>
        <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
                <h4 className="text-blue-400 font-bold">Blue Team</h4>
                {liveGame.participants.filter((p:any) => p.teamId === 100).map((p:any) => (
                    <div key={p.puuid}>{p.riotId} ({p.championId})</div> // Musisz zmapować ID championa na nazwę
                ))}
            </div>
            <div>
                <h4 className="text-red-400 font-bold">Red Team</h4>
                {liveGame.participants.filter((p:any) => p.teamId === 200).map((p:any) => (
                    <div key={p.puuid}>{p.riotId} ({p.championId})</div>
                ))}
            </div>
        </div>
    </div>
)}
      </div>

      <div className="space-y-8">
        
        
    

<PlayerMainPanel summoner={summoner.data} ranked={ranked.data} matches={matches.data || []} />
        {/* Podsumowanie i Rangi obok siebie na dużych ekranach */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <PlayerSummary matches={matches.data || []} leagueData={ranked.data || null} puuid={summoner.data.puuid} />
                
                {matches.isLoading ? (
                  <div className="py-10 flex justify-center"><LoadingSpinner /></div>
                ) : (
                  matches.data && <MatchList matchDetails={matches.data} puuid={summoner.data.puuid} />
                )}
            </div>

            <div className="lg:col-span-1">
                {ranked.isLoading ? <LoadingSpinner /> : (
                  ranked.data && <RankedData rankedData={ranked.data} />
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
