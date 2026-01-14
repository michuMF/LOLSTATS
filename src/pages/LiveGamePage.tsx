import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSummonerData } from "../hooks/useSummonerData"; // <-- Twój hook
import { fetchLiveGame, type LiveGameDTO } from "../api/fetchLiveGame";
import {LoadingSpinner} from "../components/ui/LoadingSpinner";
import {ErrorMessage} from "../components/ui/ErrorMessage";

// ... (komponent ParticipantRow bez zmian) ...
const ParticipantRow = ({ p, teamColor }: { p: any; teamColor: string }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-opacity-40 backdrop-blur-sm mb-2 border-l-4 ${
      teamColor === 'blue' ? 'bg-blue-900/30 border-blue-500' : 'bg-red-900/30 border-red-500'
    }`}>
      <div className="relative">
        <img 
          src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${p.championId}.png`}
          alt="Champion"
          className="w-10 h-10 rounded-full border border-slate-500"
          onError={(e) => (e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/29.png")} 
        />
      </div>
      
      <div className="flex flex-col">
        <span className="font-bold text-white text-sm">
          {p.riotId || p.summonerName || "Bot"}
        </span>
        <span className="text-xs text-slate-400">
           {/* Tutaj możesz dodać co chcesz */}
        </span>
      </div>
    </div>
  );

const LiveGamePage = () => {
  // 1. Pobieramy parametry czytelne (Nick, Tag)
  const { region, gameName, tagLine } = useParams();

  // 2. Używamy hooka, żeby zdobyć PUUID (React Query użyje cache, jeśli wchodzisz z profilu!)
  const { summoner, isLoading: isSummonerLoading, error: summonerError } = useSummonerData(
    gameName || "", 
    tagLine || "", 
    region || ""
  );

  const [game, setGame] = useState<LiveGameDTO | null>(null);
  const [gameLoading, setGameLoading] = useState(false); // Osobny loading dla samej gry
  const [gameError, setGameError] = useState<string | null>(null);

  // 3. Jak tylko mamy summonera (i jego PUUID), pobieramy mecz
  useEffect(() => {
    const loadGame = async () => {
      const puuid = summoner?.puuid;
      
      if (!puuid || !region) return;

      try {
        setGameLoading(true);
        // Backend wymaga PUUID
        const data = await fetchLiveGame(puuid, region);
        
        if (!data) {
          setGameError("Gracz nie jest aktualnie w grze.");
        } else {
          setGame(data);
        }
      } catch (err: any) {
        setGameError("Nie udało się pobrać danych meczu.");
      } finally {
        setGameLoading(false);
      }
    };

    // Uruchom tylko gdy mamy już dane gracza
    if (summoner) {
        loadGame();
    }
  }, [summoner, region]); // Zależność: uruchom ponownie, gdy załaduje się summoner

  // --- RENDERING ---

  // Jeśli ładujemy dane gracza LUB dane meczu
  if (isSummonerLoading || (gameLoading && !gameError)) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  // Błędy
  if (summonerError || gameError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 text-white">
        <ErrorMessage message={typeof summonerError === 'string' ? summonerError : (gameError || "Błąd")} />
        <Link to={`/profile/${region}/${gameName}/${tagLine}`} className="text-blue-400 hover:underline">
          Wróć do profilu
        </Link>
      </div>
    );
  }

  if (!game) return <div className="text-white text-center mt-10">Brak danych.</div>;

  // ... (Reszta kodu renderowania Blue/Red team bez zmian) ...
  const blueTeam = game.participants.filter((p) => p.teamId === 100);
  const redTeam = game.participants.filter((p) => p.teamId === 200);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
       <div className="max-w-6xl mx-auto">
         {/* HEADER */}
         <div className="flex justify-between items-center mb-8">
            <Link to={`/profile/${region}/${gameName}/${tagLine}`} className="text-slate-400 hover:text-white transition">← Wróć do profilu</Link>
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-wider text-blue-400">{game.gameMode}</h1>
                <p className="text-slate-500 text-sm">Mapa: {game.mapId} • Czas gry: {Math.floor(game.gameLength / 60)} min</p>
            </div>
            <div className="w-10"></div>
        </div>

        {/* GRIDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div>
                <h2 className="text-blue-400 font-bold mb-4 uppercase tracking-widest border-b border-blue-900 pb-2">Blue Team</h2>
                {blueTeam.map((p) => <ParticipantRow key={p.puuid || Math.random()} p={p} teamColor="blue" />)}
            </div>
             <div>
                <h2 className="text-red-400 font-bold mb-4 uppercase tracking-widest border-b border-red-900 pb-2 text-right">Red Team</h2>
                {redTeam.map((p) => <ParticipantRow key={p.puuid || Math.random()} p={p} teamColor="red" />)}
            </div>
        </div>
       </div>
    </div>
  );
};

export default LiveGamePage;