import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSummonerData } from "../hooks/useSummonerData";
import { fetchLiveGame, type LiveGameDTO, type LiveParticipantDTO } from "../api/fetchLiveGame";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";

// --- KOMPONENT WIERSZA UCZESTNIKA ---
// Wyciągnięty poza główny komponent dla czystości kodu
const ParticipantRow = ({ p, teamColor }: { p: LiveParticipantDTO; teamColor: 'blue' | 'red' }) => {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-opacity-40 backdrop-blur-sm mb-2 border-l-4 ${
      teamColor === 'blue' ? 'bg-blue-900/30 border-blue-500' : 'bg-red-900/30 border-red-500'
    }`}>
      <div className="relative">
        {/* ZMIANA: Używamy communitydragon, ponieważ API Live zwraca ID (np. 266), 
            a DDragon wymaga nazwy (np. Aatrox). Communitydragon obsługuje ID. */}
        <img 
          src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
          alt="Champion"
          className="w-10 h-10 rounded-full border border-slate-500 bg-slate-800"
          onError={(e) => (e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/29.png")} 
        />
      </div>
      
      <div className="flex flex-col">
        <span className="font-bold text-white text-sm">
          {/* Priorytetyzacja Riot ID -> Summoner Name -> Bot */}
          {p.riotId || p.summonerName || (p.bot ? "Bot" : "Unknown")}
        </span>
        {/* Opcjonalnie: Tutaj można dodać ikony czarów przywoływacza (spells) */}
      </div>
    </div>
  );
};

// --- GŁÓWNY KOMPONENT STRONY ---
const LiveGamePage = () => {
  const { region, gameName, tagLine } = useParams();

  // 1. POPRAWKA: Destrukturyzacja danych z Twojego hooka.
  // Twój hook useSummonerData zwraca strukturę: { summoner: { data: ..., isLoading: ... }, ... }
  // Musimy to rozpakować, aby dostać się do właściwych danych.
  const { summoner: summonerQuery, isLoading: isSummonerLoading, error: summonerError } = useSummonerData(
    gameName || "", 
    tagLine || "", 
    region || ""
  );

  // Wyciągamy właściwe dane profilu (gdzie znajduje się PUUID)
  const summoner = summonerQuery?.data;

  const [game, setGame] = useState<LiveGameDTO | null>(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

 useEffect(() => {
    // Resetuj stan TYLKO gdy zmieni się gracz (PUUID) lub region
    setGameError(null);
    setGame(null);

    const loadGame = async () => {
      // Używamy opcjonalnego łańcuchowania (optional chaining)
      const puuid = summoner?.puuid;

      if (!puuid || !region) {
        return;
      }

      console.log(`🔍 LiveGamePage: Szukam gry dla PUUID: ${puuid}`);

      try {
        setGameLoading(true);
        const data = await fetchLiveGame(puuid, region);
        
        if (!data) {
          console.log("📭 LiveGamePage: Gracz nie jest w grze.");
          setGameError("Gracz nie jest aktualnie w grze.");
        } else {
          console.log("✅ LiveGamePage: Znaleziono grę!");
          setGame(data);
        }
      } catch (err) {
        console.error("❌ LiveGamePage Error:", err);
        setGameError("Wystąpił błąd podczas pobierania danych meczu.");
      } finally {
        setGameLoading(false);
      }
    };

    // URUCHOM, JEŚLI:
    // 1. Mamy obiekt summoner (sprawdzamy logicznie wewnątrz funkcji)
    // 2. Mamy puuid (to jest główny trigger)
    if (summoner?.puuid) {
        loadGame();
    }
    
    // KLUCZOWA ZMIANA PONIŻEJ:
    // Zamiast [summoner, region] dajemy [summoner?.puuid, region]
  }, [summoner?.puuid, region]); // Zależność od obiektu summoner

  // --- RENDERING ---

  // 1. Stan ładowania (czekamy na profil gracza LUB dane meczu)
  if (isSummonerLoading || gameLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-900">
            <LoadingSpinner />
            <p className="text-slate-400 animate-pulse">
                {isSummonerLoading ? "Szukam profilu gracza..." : "Pobieram dane meczu na żywo..."}
            </p>
        </div>
    );
  }

  // 2. Stan błędu (API zwróciło błąd lub nie znaleziono gracza)
  if (summonerError || (gameError && !game)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6 text-white bg-slate-900 p-4">
        <ErrorMessage message={typeof summonerError === 'string' ? summonerError : (gameError || "Nieznany błąd")} />
        
        <Link 
            to={`/profile/${region}/${gameName}/${tagLine}`} 
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Wróć do profilu
        </Link>
      </div>
    );
  }

  // 3. Stan pusty (brak gry, brak błędu - np. tuż przed załadowaniem)
  if (!game) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500">
            Brak danych do wyświetlenia.
        </div>
    );
  }

  // 4. Wyświetlanie Gry
  const blueTeam = game.participants.filter((p) => p.teamId === 100);
  const redTeam = game.participants.filter((p) => p.teamId === 200);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
       <div className="max-w-6xl mx-auto">
         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <Link to={`/profile/${region}/${gameName}/${tagLine}`} className="text-slate-400 hover:text-white transition self-start md:self-center">
                ← Wróć do profilu
            </Link>
            
            <div className="text-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 min-w-[300px]">
                <h1 className="text-2xl font-bold tracking-wider text-blue-400 mb-1">{game.gameMode}</h1>
                <p className="text-slate-400 text-sm font-mono">
                    Mapa: <span className="text-white">{game.mapId}</span> • 
                    Czas gry: <span className="text-white">{Math.floor(game.gameLength / 60)} min</span>
                </p>
            </div>
            
            <div className="w-10 hidden md:block"></div> 
        </div>

        {/* GRIDS UCZESTNIKÓW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {/* BLUE TEAM */}
            <div>
                <h2 className="text-blue-400 font-bold mb-4 uppercase tracking-widest border-b border-blue-900 pb-2 flex justify-between">
                    Blue Team 
                    <span className="text-xs text-blue-600 self-center">Team 100</span>
                </h2>
                <div className="space-y-2">
                    {blueTeam.map((p) => (
                        <ParticipantRow key={p.summonerId || `${p.teamId}-${p.championId}`} p={p} teamColor="blue" />
                    ))}
                </div>
            </div>

            {/* RED TEAM */}
            <div>
                <h2 className="text-red-400 font-bold mb-4 uppercase tracking-widest border-b border-red-900 pb-2 text-right flex justify-between flex-row-reverse">
                    Red Team
                    <span className="text-xs text-red-600 self-center">Team 200</span>
                </h2>
                <div className="space-y-2">
                    {redTeam.map((p) => (
                        <ParticipantRow key={p.summonerId || `${p.teamId}-${p.championId}`} p={p} teamColor="red" />
                    ))}
                </div>
            </div>
        </div>
       </div>
    </div>
  );
};

export default LiveGamePage;