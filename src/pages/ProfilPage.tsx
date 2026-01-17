import { Link, useParams } from "react-router-dom";
import { useSummonerData } from "../hooks/useSummonerData";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { SearchBar } from "../SearchBar/SearchBar";



import { RankedData } from "../SearchBar/RankedData";
import { MatchList } from "../match/MatchList";
import { PlayerSummary } from "../SearchBar/PlayerSummary";
import { PlayerMainPanel } from "../ProfilePageComponents/PlayerMainPanel";
import { FaGamepad } from "react-icons/fa";


export const ProfilePage = () => {



  // Pobieramy region z URL
  const { region, gameName, tagLine } = useParams(); 
  
  // Przekazujemy region do hooka
  const { summoner, ranked, matches, isLoading, error } = useSummonerData(gameName!, tagLine!, region!);

   
   const dataMatches = matches.data;

    {dataMatches && console.log("Matches in ProfilePage:", dataMatches[0].info);}
    
    

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
        



<div className="mt-6 flex justify-center">
  <Link 
    to={`/live/${region}/${summoner.data.puuid}`}
    className="
      group relative inline-flex items-center gap-3 px-8 py-3 
      bg-gradient-to-r from-blue-600 to-blue-500 
      hover:from-blue-500 hover:to-blue-400 
      text-white font-bold text-lg rounded-full 
      shadow-[0_0_15px_rgba(37,99,235,0.5)] 
      hover:shadow-[0_0_25px_rgba(37,99,235,0.8)] 
      transform transition-all duration-300 hover:-translate-y-1 hover:scale-105
    "
  >
   
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
    </span>

    <span>Live Game</span>
    
    
    <FaGamepad className="text-xl opacity-80 group-hover:rotate-12 transition-transform" />
  </Link>
</div>
      </div>

      <div className="space-y-8">
        
        
        


<PlayerMainPanel summoner={summoner.data} ranked={ranked.data} matches={dataMatches || []} />
       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <PlayerSummary matches={dataMatches || []} leagueData={ranked.data || null} puuid={summoner.data.puuid} />
                
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
