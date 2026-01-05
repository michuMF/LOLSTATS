import { useState } from "react";
import type { MatchDetailsType } from "../types/types";
import { FaAngleDown, FaAngleUp, FaRobot, FaMagic } from "react-icons/fa"; // Dodałem ikonki AI
import { analyzeMatch } from "../utils/analyzeMatch"; // Importujemy nasz "Mózg"

// Mapa spelli (bez zmian)
const spellMap: Record<number, string> = {
  1: "SummonerBoost", 3: "SummonerExhaust", 4: "SummonerFlash",
  6: "SummonerHaste", 7: "SummonerHeal", 11: "SummonerSmite",
  12: "SummonerTeleport", 13: "SummonerMana", 14: "SummonerDot",
  21: "SummonerBarrier", 30: "SummonerPoroRecall", 31: "SummonerPoroThrow",
  32: "SummonerSnowball", 39: "SummonerSnowURFSnowball_Mark",
};

const getQueueName = (queueId: number) => {
  switch (queueId) {
    case 420: return "Ranked Solo";
    case 440: return "Ranked Flex";
    case 400: return "Normal Draft";
    case 430: return "Normal Blind";
    case 450: return "ARAM";
    default: return "Normal";
  }
};

export const MatchHistory = ({
  matchDetails,
  puuid,
}: {
  matchDetails?: MatchDetailsType[];
  puuid: string;
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);

  const toggleMatch = (gameId: number) => {
    setExpandedMatchId(expandedMatchId === gameId ? null : gameId);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
         Match History
      </h3>
      <ul className="space-y-2">
        {matchDetails?.map((match) => {
          const self = match.info.participants.find((p) => p.puuid === puuid);
          const isWin = self?.win || false;
          const gameId = match.info.gameId;
          const isExpanded = expandedMatchId === gameId;

          // Obliczamy ocenę AI
          const aiAnalysis = self ? analyzeMatch(self, match.info.gameDuration) : null;

          const cardBg = isWin ? "bg-blue-50" : "bg-red-50";
          const borderColor = isWin ? "border-blue-300" : "border-red-300";
          const stripColor = isWin ? "bg-blue-500" : "bg-red-500";
          const textColor = isWin ? "text-blue-700" : "text-red-700";

          const items = [self?.item0, self?.item1, self?.item2, self?.item3, self?.item4, self?.item5];
          const trinket = self?.item6;

          return (
            <li
              key={gameId}
              className={`rounded-lg shadow-sm border ${borderColor} ${cardBg} overflow-hidden transition-all duration-200`}
            >
              {/* --- NAGŁÓWEK --- */}
              <div
                onClick={() => toggleMatch(gameId)}
                className="flex items-center cursor-pointer h-28 hover:brightness-95 transition-all py-2 relative"
              >
                <div className={`w-2 h-full ${stripColor} mr-4`}></div>

                {/* Info */}
                <div className="w-24 flex flex-col justify-center text-xs text-gray-600 space-y-1">
                  <p className={`font-bold text-sm ${textColor}`}>{getQueueName(match.info.queueId)}</p>
                  <p>{new Date(match.info.gameEndTimestamp).toLocaleDateString()}</p>
                  <p className={`font-bold ${isWin ? "text-blue-600" : "text-red-600"}`}>
                    {isWin ? "Victory" : "Defeat"}
                  </p>
                  <p>{Math.floor(match.info.gameDuration / 60)}m {match.info.gameDuration % 60}s</p>
                </div>

                {/* Postać */}
                {self && (
                  <div className="flex items-center space-x-3 mx-4">
                    <div className="relative">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${self.championName}_0.jpg`}
                        alt={self.championName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-400"
                      />
                      <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1.5 rounded-full border border-gray-600">
                        {self.champLevel}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-1">
                      {[self.summoner1Id, self.summoner2Id].map((spellId, idx) => (
                        <img
                          key={idx}
                          src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/spell/${spellMap[spellId]}.png`}
                          alt="Spell"
                          className="w-7 h-7 rounded border border-gray-400 bg-black"
                        />
                      ))}
                    </div>

                    <div className="flex flex-col w-24 text-center">
                      <p className="font-bold text-gray-800 text-lg">
                        {self.kills} / <span className="text-red-600">{self.deaths}</span> / {self.assists}
                      </p>
                      <p className="text-xs text-gray-500">
                        {((self.kills + self.assists) / Math.max(1, self.deaths)).toFixed(2)}:1 KDA
                      </p>
                      
                      {/* Mała odznaka z oceną widoczna od razu */}
                      {aiAnalysis && (
                        <div className={`mt-1 text-xs font-bold border rounded px-1 ${aiAnalysis.color} border-current opacity-80`}>
                           Grade: {aiAnalysis.grade}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Itemy */}
                <div className="flex-grow flex items-center justify-start space-x-1 pl-4 border-l border-gray-300/50 h-16">
                  {items.map((itemId, idx) => (
                    <div key={idx} className="w-8 h-8 rounded bg-gray-200 border border-gray-300 overflow-hidden">
                      {itemId !== 0 && (
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/item/${itemId}.png`}
                          alt={`Item ${itemId}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                  <div className="ml-2 w-8 h-8 rounded-full bg-gray-200 border border-gray-300 overflow-hidden">
                    {trinket !== 0 && (
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/item/${trinket}.png`}
                        alt="Trinket"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="pr-6 text-gray-500">
                  {isExpanded ? <FaAngleUp size={24} /> : <FaAngleDown size={24} />}
                </div>
              </div>

              {/* --- SZCZEGÓŁY + AI ANALYSIS --- */}
              {isExpanded && (
                <div className="border-t border-gray-300 bg-white animate-fadeIn">
                  
                  {/* SEKCJA AI - POKAZUJEMY JĄ NA GÓRZE SZCZEGÓŁÓW */}
                  {aiAnalysis && (
                    <div className="p-4 bg-gray-900 text-white border-b border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="flex items-center gap-2 text-xl font-bold text-purple-400">
                           <FaRobot /> AI Match Analysis
                        </h4>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className="text-xs text-gray-400">Performance Score</p>
                              <p className={`text-3xl font-bold ${aiAnalysis.color}`}>{aiAnalysis.score}/100</p>
                           </div>
                           <div className={`text-4xl font-extrabold ${aiAnalysis.color} border-2 border-current w-16 h-16 flex items-center justify-center rounded-lg`}>
                              {aiAnalysis.grade}
                           </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                         <p className="text-sm font-bold text-gray-300 uppercase tracking-wide">AI Feedback:</p>
                         <ul className="space-y-1">
                            {aiAnalysis.feedback.map((tip, index) => (
                               <li key={index} className="flex items-start gap-2 text-sm text-gray-200 bg-gray-800 p-2 rounded">
                                  <span className="text-purple-400 mt-0.5"><FaMagic /></span>
                                  {tip}
                               </li>
                            ))}
                         </ul>
                      </div>
                    </div>
                  )}

                  {/* TABELE DRUŻYN (BEZ ZMIAN) */}
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-blue-600 mb-2">Blue Team</h4>
                      <div className="space-y-1">
                        {match.info.participants
                          .filter((p) => p.teamId === 100)
                          .map((participant, i) => (
                            <ParticipantRow key={i} participant={participant} puuid={puuid} />
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-600 mb-2">Red Team</h4>
                      <div className="space-y-1">
                        {match.info.participants
                          .filter((p) => p.teamId === 200)
                          .map((participant, i) => (
                            <ParticipantRow key={i} participant={participant} puuid={puuid} />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ParticipantRow (bez zmian)
const ParticipantRow = ({ participant, puuid }: { participant: any, puuid: string }) => {
  const isMe = participant.puuid === puuid;
  return (
    <div
      className={`flex items-center p-1 rounded ${
        isMe ? "bg-yellow-100 border border-yellow-300" : "bg-gray-50"
      }`}
    >
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${participant.championName}_0.jpg`}
        alt={participant.championName}
        className="w-8 h-8 rounded object-cover mr-2"
      />
      <div className="flex-grow truncate">
        <p className={`text-xs ${isMe ? "font-bold" : "text-gray-700"}`}>
          {participant.riotIdGameName}
        </p>
      </div>
      <div className="text-xs text-gray-500 whitespace-nowrap">
        {participant.kills}/{participant.deaths}/{participant.assists}
      </div>
    </div>
  );
};