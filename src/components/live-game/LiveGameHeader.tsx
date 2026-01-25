// src/components/live-game/LiveGameHeader.tsx
import type { LiveGameDTO } from "../../types/live-game";
import { formatDuration } from "../../utils/calculateStats";

interface LiveGameHeaderProps {
  game: LiveGameDTO;
  getChampionName: (id: number) => string; // Nowy prop
  version: string;
}

export const LiveGameHeader = ({ game, getChampionName, version }: LiveGameHeaderProps) => {
  const displayTime = game.gameStartTime > 0 
    ? formatDuration(Math.floor((Date.now() - game.gameStartTime) / 1000)) 
    : "Loading...";

  // Sortujemy bany po teamId (100 -> Blue, 200 -> Red)
  const blueBans = game.bannedChampions.filter(b => b.teamId === 100);
  const redBans = game.bannedChampions.filter(b => b.teamId === 200);

  return (
    <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg mb-8 border-b-4 border-blue-500">
      <div className="text-center mb-4">
          <h2 className="text-2xl font-bold uppercase tracking-widest">{game.gameMode}</h2>
          <span className="text-green-400 font-mono text-lg">{displayTime}</span>
      </div>

      {/* Sekcja Banów */}
      {(blueBans.length > 0 || redBans.length > 0) && (
        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg mt-4">
            <div className="flex gap-2">
                <span className="text-blue-400 text-xs font-bold uppercase mr-2 self-center">Bans</span>
                {blueBans.map(ban => (
                    <img 
                        key={ban.pickTurn}
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${getChampionName(ban.championId)}.png`}
                        className="w-8 h-8 rounded border border-slate-600 grayscale opacity-70"
                        alt="Ban"
                        title={getChampionName(ban.championId)}
                    />
                ))}
            </div>

            <span className="text-slate-600 text-xs">VS</span>

            <div className="flex gap-2 flex-row-reverse">
                <span className="text-red-400 text-xs font-bold uppercase ml-2 self-center">Bans</span>
                {redBans.map(ban => (
                    <img 
                        key={ban.pickTurn}
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${getChampionName(ban.championId)}.png`}
                        className="w-8 h-8 rounded border border-slate-600 grayscale opacity-70"
                        alt="Ban"
                        title={getChampionName(ban.championId)}
                    />
                ))}
            </div>
        </div>
      )}
    </div>
  );
};