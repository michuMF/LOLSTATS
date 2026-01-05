
import type { MatchDTO, RankedDataType } from '../types/types'; // POPRAWIONE IMPORTY
import { calculatePlayerStats } from '../utils/calculateStats';

interface PlayerSummaryProps {
  matches: MatchDTO[];
  leagueData: RankedDataType[] | undefined | null; // POPRAWIONY TYP
  puuid: string;
}

const PlayerSummary: React.FC<PlayerSummaryProps> = ({ matches, leagueData, puuid }) => {
  if (!matches || matches.length === 0) return null;

  // 1. Obliczamy statystyki z ostatnich gier
  const recentStats = calculatePlayerStats(matches, puuid);

  // 2. Szukamy danych z CAŁEGO SEZONU (RankedDataType)
  // W Twoim types.ts pole nazywa się 'queueType', a wartość dla solo to 'RANKED_SOLO_5x5'
  const soloDuo = leagueData?.find((entry) => entry.queueType === "RANKED_SOLO_5x5");
  
  const seasonWins = soloDuo ? soloDuo.wins : 0;
  const seasonLosses = soloDuo ? soloDuo.losses : 0;
  const seasonGames = seasonWins + seasonLosses;
  const seasonWinRate = seasonGames > 0 ? Math.round((seasonWins / seasonGames) * 100) : 0;

  // Funkcja pomocnicza do kolorów KDA
  const getKdaColor = (kda: string) => {
    const num = parseFloat(kda);
    if (num >= 4) return "text-yellow-400";
    if (num >= 3) return "text-blue-400";
    if (num >= 2) return "text-green-400";
    return "text-gray-400";
  };

  const getWrColor = (wr: number) => {
      if (wr >= 55) return "text-yellow-400";
      if (wr >= 50) return "text-green-400";
      return "text-gray-400";
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg border border-gray-700 text-white">
      <div className="flex justify-between items-end border-b border-gray-600 pb-2 mb-4">
        <h2 className="text-xl font-bold">Podsumowanie Gracza</h2>
        <span className="text-xs text-gray-400 uppercase tracking-widest">Analiza Sezonu & Formy</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEWA STRONA: Główne Statystyki */}
        <div className="space-y-6">
            
            {/* Sekcja 1: CAŁY SEZON */}
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h3 className="text-xs text-gray-400 uppercase font-bold mb-3">Cały Sezon (Solo/Duo)</h3>
                <div className="flex justify-between items-center">
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${getWrColor(seasonWinRate)}`}>{seasonWinRate}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                    <div className="h-8 w-px bg-gray-600 mx-4"></div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">{seasonGames}</div>
                        <div className="text-xs text-gray-400">Gier</div>
                    </div>
                    <div className="text-center ml-4">
                        <div className="text-sm text-green-400">{seasonWins} W</div>
                        <div className="text-sm text-red-400">{seasonLosses} L</div>
                    </div>
                </div>
            </div>

            {/* Sekcja 2: FORMA (Ostatnie gry) */}
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h3 className="text-xs text-gray-400 uppercase font-bold mb-3">Forma (Ostatnie {recentStats.totalGames} gier)</h3>
                <div className="flex justify-between items-center">
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${getKdaColor(recentStats.avgKda)}`}>{recentStats.avgKda}</div>
                        <div className="text-xs text-gray-400">Śr. KDA</div>
                    </div>
                    <div className="h-8 w-px bg-gray-600 mx-4"></div>
                     <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">{recentStats.preferredRole}</div>
                        <div className="text-xs text-gray-400">Główna Rola</div>
                    </div>
                     <div className="text-center ml-4">
                        <div className="text-xl font-bold text-gray-300">{recentStats.avgCs}</div>
                        <div className="text-xs text-gray-400">CS/m</div>
                    </div>
                </div>
            </div>
        </div>

        {/* PRAWA STRONA: Top Postacie */}
        <div>
            <h3 className="text-xs text-gray-400 uppercase font-bold mb-3">Najczęściej grane (Ostatnie 20)</h3>
            <div className="space-y-3">
                {recentStats.topChampions.map((champ) => {
                    const champWinRate = Math.round((champ.wins / champ.games) * 100);
                    const champKda = ((champ.kills + champ.assists) / Math.max(1, champ.deaths)).toFixed(2);
                    
                    return (
                        <div key={champ.championName} className="flex items-center bg-gray-700 p-2 rounded-md hover:bg-gray-600 transition border border-gray-600">
                            <img 
                                src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champ.championName}.png`} 
                                alt={champ.championName}
                                className="w-10 h-10 rounded-md mr-3 shadow-sm"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm text-white">{champ.championName}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${champWinRate >= 50 ? 'bg-blue-900 text-blue-200' : 'bg-red-900 text-red-200'}`}>
                                        {champWinRate}% WR
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>{champ.games} gier</span>
                                    <span className={getKdaColor(champKda)}>{champKda} KDA</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {recentStats.topChampions.length === 0 && (
                     <div className="text-gray-500 text-sm text-center py-4">Brak danych o postaciach</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerSummary;