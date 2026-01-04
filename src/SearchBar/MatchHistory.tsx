import type { MatchDetailsType } from "../types/types";

export const MatchHistory = ({
  matchDetails,
  
}: {
  matchDetails?: MatchDetailsType[];
}) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Match History</h3>
      <ul className="space-y-4">
        {matchDetails?.map((match, index) => (
          <li
            key={index}
            className={`p-4 rounded-lg shadow-md bg-gray-100`}
          >
            {/* Nagłówek meczu */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Game Mode:</strong> {match.info.gameMode}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Duration:</strong>{" "}
                  {Math.floor(match.info.gameDuration / 60)}m{" "}
                  {match.info.gameDuration % 60}s
                </p>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Match ID:</strong> {match.info.gameId}
              </p>
            </div>

            {/* Drużyny */}
            <div className="grid grid-cols-2 gap-4">
              {/* Drużyna 1 */}
              <div>
                <h4 className="text-sm font-bold text-blue-500 mb-2">Team 1</h4>
                <div className="space-y-2">
                  {match.info.participants
                    .filter((participant) => participant.teamId === 100)
                    .map((participant, i) => (
                      <div
                        key={i}
                        className="flex items-center bg-white p-2 rounded-lg shadow-sm"
                      >
                        {/* Zdjęcie bohatera */}
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${participant.championName}_0.jpg`}
                          alt={participant.championName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />

                        {/* Statystyki */}
                        <div className="ml-4 flex flex-col">
                          <p className="text-sm font-bold text-gray-800">
                            {participant.riotIdGameName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Champion:</strong> {participant.championName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>K/D/A:</strong> {participant.kills}/
                            {participant.deaths}/{participant.assists}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Gold:</strong> {participant.goldEarned}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Drużyna 2 */}
              <div>
                <h4 className="text-sm font-bold text-red-500 mb-2">Team 2</h4>
                <div className="space-y-2">
                  {match.info.participants
                    .filter((participant) => participant.teamId === 200)
                    .map((participant, i) => (
                      <div
                        key={i}
                        className="flex items-center bg-white p-2 rounded-lg shadow-sm"
                      >
                        {/* Zdjęcie bohatera */}
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${participant.championName}_0.jpg`}
                          alt={participant.championName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />

                        {/* Statystyki */}
                        <div className="ml-4 flex flex-col">
                          <p className="text-sm font-bold text-gray-800">
                            {participant.riotIdGameName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Champion:</strong> {participant.championName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>K/D/A:</strong> {participant.kills}/
                            {participant.deaths}/{participant.assists}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Gold:</strong> {participant.goldEarned}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};