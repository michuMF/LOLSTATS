import { Routes, Route, useParams, Link } from 'react-router-dom';
import { SearchBar } from './SearchBar/SearchBar';
import { SummonerDetails } from './SearchBar/SummonerDetails';
import { RankedData } from './SearchBar/RankedData';
import { MatchHistory } from './SearchBar/MatchHistory';
import { useSummonerData } from './hooks/useSummonerData';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorMessage } from './components/ui/ErrorMessage';
import './App.css';
import PlayerSummary from './SearchBar/PlayerSummary';

// -- STRONA STARTOWA --
const HomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fadeIn">
    <div className="text-center space-y-2">
       <h1 className="text-6xl font-black text-slate-800 tracking-tight">
         LOL<span className="text-blue-600">STATS</span>
       </h1>
       <p className="text-slate-500 text-lg">Wyszukiwarka statystyk League of Legends z analizą AI</p>
    </div>
    <SearchBar />
  </div>
);

// -- STRONA PROFILU --
const ProfilePage = () => {
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
      </div>

      <div className="space-y-8">
        {/* Dane profilowe */}
        <SummonerDetails 
           summonerData={{
             ...summoner.data,
             gameName: gameName!,
             tagLine: tagLine!,
             puuid: summoner.data.puuid
           }} 
        />

        {/* Podsumowanie i Rangi obok siebie na dużych ekranach */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <PlayerSummary matches={matches.data || []} leagueData={ranked.data || null} puuid={summoner.data.puuid} />
                
                {matches.isLoading ? (
                  <div className="py-10 flex justify-center"><LoadingSpinner /></div>
                ) : (
                  matches.data && <MatchHistory matchDetails={matches.data} puuid={summoner.data.puuid} />
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

function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans text-slate-900">
       <Routes>
         <Route path="/" element={<HomePage />} />
         {/* Dodano :region do ścieżki */}
         <Route path="/profile/:region/:gameName/:tagLine" element={<ProfilePage />} />
       </Routes>
    </div>
  );
}

export default App;