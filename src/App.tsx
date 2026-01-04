import './App.css';
import { SummonerProfile } from './SearchBar/SummonerProfile';




function App() {
  

  return (
    <>
      <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-6">
        {/* Nagłówek aplikacji */}
        <h1 className="text-4xl font-bold text-center mb-6">LOLSTATS</h1>

        {/* Profil przywoływacza */}
        <SummonerProfile />
      </div>
    </>
  );
}

export default App;
