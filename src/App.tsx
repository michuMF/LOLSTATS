import { Routes, Route, useParams, Link } from 'react-router-dom';
import { SearchBar } from './SearchBar/SearchBar';
import { SummonerDetails } from './SearchBar/SummonerDetails';
import { RankedData } from './SearchBar/RankedData';
import { MatchHistory } from './SearchBar/MatchHistory';
import { useSummonerData } from './hooks/useSummonerData';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorMessage } from './components/ui/ErrorMessage';
import './App.css';

// -- STRONA STARTOWA --
const HomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fadeIn">
    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
      LOLSTATS
    </h1>
    <SearchBar />
  </div>
);

// -- STRONA PROFILU --
const ProfilePage = () => {
  const { gameName, tagLine } = useParams(); // Pobierz parametry z URL
  
  // Używamy naszego hooka!
  const { summoner, ranked, matches, isLoading, error } = useSummonerData(gameName!, tagLine!);

  if (isLoading) return <LoadingSpinner />;
  
  if (error || (summoner.isError)) {
    return <ErrorMessage message="Nie udało się znaleźć przywoływacza. Sprawdź poprawność Nicku#TAG." />;
  }

  // Upewniamy się, że dane istnieją przed wyświetleniem
  if (!summoner.data) return null;

  return (
    <div className="animate-fadeIn w-full max-w-4xl mx-auto">
      {/* Nagłówek z powrotem i wyszukiwarką */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:underline">LOLSTATS</Link>
        <div className="w-full sm:w-auto">
          <SearchBar />
        </div>
      </div>

      <div className="space-y-6">
        {/* Dane profilowe */}
        <SummonerDetails 
           summonerData={{
             ...summoner.data,
             gameName: gameName!,
             tagLine: tagLine!,
             puuid: summoner.data.puuid // fetchSummonerDetails zwraca puuid? sprawdzimy typy
           }} 
        />

        {/* Rangi */}
        {ranked.isLoading ? <LoadingSpinner /> : (
           ranked.data && <RankedData rankedData={ranked.data} />
        )}

        {/* Historia Meczów */}
        {matches.isLoading ? (
           <div className="py-10"><LoadingSpinner /></div>
        ) : (
           matches.data && <MatchHistory matchDetails={matches.data} puuid={summoner.data.puuid} />
        )}
      </div>
    </div>
  );
};

// -- GŁÓWNA STRUKTURA --
function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
       <Routes>
         <Route path="/" element={<HomePage />} />
         <Route path="/profile/:gameName/:tagLine" element={<ProfilePage />} />
       </Routes>
    </div>
  );
}

export default App;