// src/pages/LiveGamePage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSummonerData } from "../hooks/useSummonerData";
import { fetchLiveGame, type LiveGameDTO, type LiveParticipantDTO } from "../api/fetchLiveGame";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { getQueueName } from "../utils/mappers";

import { type MatchDetailsType } from "../api/fetchMatchDetails"; // Potrzebny typ do cache
import { PlayerDetailModal } from "../LiveGame/PlayerDetailModal";


// ... (getMapName, ParticipantRow, BannedChamp - bez zmian, skopiuj ze starego pliku lub zostaw jak są) ...

// Kopiujemy pomocnicze komponenty żeby plik był kompletny:
const getMapName = (mapId: number) => {
  switch (mapId) {
    case 11: return "Summoner's Rift";
    case 12: return "Howling Abyss";
    case 21: return "Nexus Blitz";
    case 30: return "Arena";
    default: return `Map ${mapId}`;
  }
};

const ParticipantRow = ({ p, teamColor, onClick }: { p: LiveParticipantDTO; teamColor: 'blue' | 'red'; onClick: () => void; }) => {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg bg-opacity-40 backdrop-blur-sm mb-2 border-l-4 transition-all hover:scale-[1.01] cursor-pointer hover:brightness-110 ${teamColor === 'blue' ? 'bg-blue-900/20 border-blue-500' : 'bg-red-900/20 border-red-500'}`}>
      <div className="relative group">
        <img 
          src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
          alt="Champion"
          className="w-10 h-10 rounded-full border border-slate-500 bg-slate-800 shadow-sm"
          onError={(e) => (e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/29.png")} 
        />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-slate-100 text-sm tracking-wide">
          {p.riotId || p.summonerName || (p.bot ? "Bot" : "Unknown")}
        </span>
      </div>
      <div className="ml-auto text-slate-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Click for details</div>
    </div>
  );
};

const BannedChamp = ({ championId }: { championId: number }) => (
  <div className="w-8 h-8 rounded border border-slate-600 overflow-hidden opacity-80 grayscale hover:grayscale-0 transition-all" title="Banned">
    {championId !== -1 ? (
        <img src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${championId}.png`} alt="Banned" className="w-full h-full object-cover" />
    ) : (<div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs text-slate-500">?</div>)}
  </div>
);

// --- GŁÓWNY KOMPONENT ---
const LiveGamePage = () => {
  const { region, gameName, tagLine } = useParams();

  // Stan Modala
  const [selectedParticipant, setSelectedParticipant] = useState<LiveParticipantDTO | null>(null);
  
  // --- NOWY STAN: CACHE GRACZY ---
  // Kluczem jest PUUID, wartością lista meczów. Dzięki temu zapamiętujemy dane.
  const [playersCache, setPlayersCache] = useState<Record<string, MatchDetailsType[]>>({});

  const { summoner: summonerQuery } = useSummonerData(gameName || "", tagLine || "", region || "");
  const [game, setGame] = useState<LiveGameDTO | null>(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

  // Funkcja aktualizująca cache, przekazywana do modala
  const handleCacheUpdate = (puuid: string, matches: MatchDetailsType[]) => {
      setPlayersCache(prev => ({
          ...prev,
          [puuid]: matches
      }));
  };

  useEffect(() => {
    setGameError(null);
    setGame(null);
    setPlayersCache({}); // Czyścimy cache przy wejściu do nowej gry live

    const loadGame = async () => {
      const puuid = summonerQuery.data?.puuid;
      if (!puuid || !region) return;

      try {
        setGameLoading(true);
        const data = await fetchLiveGame(puuid, region);
        if (!data) {
          setGameError("Gracz nie jest aktualnie w grze.");
        } else {
          setGame(data);
        }
      } catch (err) {
        console.error(err);
        setGameError("Wystąpił błąd podczas pobierania danych meczu.");
      } finally {
        setGameLoading(false);
      }
    };

    if (summonerQuery.data?.puuid) {
        loadGame();
    }
  }, [summonerQuery.data?.puuid, region]);

  if (gameLoading || summonerQuery.isLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-900">
            <LoadingSpinner />
            <p className="text-slate-400 animate-pulse font-mono text-sm">LOADING LIVE GAME...</p>
        </div>
    );
  }

  if (summonerQuery.error || (gameError && !game)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6 text-white bg-slate-900 p-4">
        <ErrorMessage message={typeof summonerQuery.error === 'string' ? summonerQuery.error : (gameError || "Nieznany błąd")} />
        <Link to={`/profile/${region}/${gameName}/${tagLine}`} className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold">Wróć do profilu</Link>
      </div>
    );
  }

  if (!game) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500">Brak danych.</div>;

  const blueTeam = game.participants.filter((p) => p.teamId === 100);
  const redTeam = game.participants.filter((p) => p.teamId === 200);
  const blueBans = (game.bannedChampions || []).filter(b => b.teamId === 100);
  const redBans = (game.bannedChampions || []).filter(b => b.teamId === 200);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-8 animate-fadeIn">
       <div className="max-w-6xl mx-auto">
         
         {/* HEADER */}
         <div className="relative mb-8 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-md shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 opacity-70"></div>
            <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-6">
               <div className="text-center md:text-left">
                   <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 uppercase tracking-tighter">
                       {getQueueName(game.gameQueueConfigId || 0)}
                   </h1>
                   <div className="flex items-center gap-3 text-slate-400 text-sm font-mono mt-1 justify-center md:justify-start">
                       <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">{getMapName(game.mapId)}</span>
                       <span>•</span>
                       <span className="text-green-400 animate-pulse">● LIVE</span>
                       <span>{Math.floor(game.gameLength / 60)} min</span>
                   </div>
               </div>
               <Link to={`/profile/${region}/${gameName}/${tagLine}`} className="px-5 py-2.5 rounded-lg border border-slate-600 hover:bg-slate-700 hover:text-white text-slate-300 transition text-sm font-bold flex items-center gap-2"><span>←</span> Profil</Link>
            </div>
         </div>

         {/* GAME GRID */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 relative">
            {/* BLUE */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-blue-900/30">
               <div className="flex justify-between items-end mb-4 border-b border-blue-500/30 pb-2">
                   <h2 className="text-blue-400 font-bold uppercase tracking-widest text-lg">Blue Team</h2>
                   <div className="flex gap-1">{blueBans.map(ban => <BannedChamp key={ban.pickTurn} championId={ban.championId} />)}</div>
               </div>
               <div className="space-y-3">
                   {blueTeam.map((p) => (
                       <ParticipantRow key={p.summonerId || `${p.teamId}-${p.championId}`} p={p} teamColor="blue" onClick={() => setSelectedParticipant(p)} />
                   ))}
               </div>
            </div>
            {/* VS */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 rounded-full items-center justify-center font-black text-slate-500 border-4 border-slate-900 z-10 shadow-lg italic">VS</div>
            {/* RED */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-red-900/30">
               <div className="flex justify-between items-end mb-4 border-b border-red-500/30 pb-2 flex-row-reverse">
                   <h2 className="text-red-400 font-bold uppercase tracking-widest text-lg">Red Team</h2>
                   <div className="flex gap-1">{redBans.map(ban => <BannedChamp key={ban.pickTurn} championId={ban.championId} />)}</div>
               </div>
               <div className="space-y-3">
                   {redTeam.map((p) => (
                       <ParticipantRow key={p.summonerId || `${p.teamId}-${p.championId}`} p={p} teamColor="red" onClick={() => setSelectedParticipant(p)} />
                   ))}
               </div>
            </div>
         </div>
       </div>

       {/* MODAL Z CACHE */}
       {selectedParticipant && (
           <PlayerDetailModal 
               participant={selectedParticipant} 
               region={region || "EUNE"} 
               onClose={() => setSelectedParticipant(null)}
               // Przekazujemy dane z cache, jeśli istnieją dla tego gracza
               cachedMatches={selectedParticipant.puuid ? playersCache[selectedParticipant.puuid] : undefined}
               // Funkcja zapisująca dane po pobraniu
               onDataLoaded={(matches) => {
                   if (selectedParticipant.puuid) {
                       handleCacheUpdate(selectedParticipant.puuid, matches);
                   }
               }}
           />
       )}
    </div>
  );
};

export default LiveGamePage;