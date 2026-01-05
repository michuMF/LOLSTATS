import { useState } from "react";
import type { MatchDetailsType, ParticipantType } from "../types/types";
import { FaAngleDown, FaAngleUp, FaRobot, FaMagic } from "react-icons/fa";
import { analyzeMatch } from "../utils/analyzeMatch";

// Mapa spelli (skrócona dla czytelności, zachowaj swoją pełną listę)
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
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
         Match History
      </h3>
      <ul className="space-y-4">
        {matchDetails?.map((match) => {
          const self = match.info.participants.find((p) => p.puuid === puuid);
          const isWin = self?.win || false;
          const gameId = match.info.gameId;
          const isExpanded = expandedMatchId === gameId;

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
              className={`rounded-xl shadow-md border ${borderColor} ${cardBg} overflow-hidden transition-all duration-300 hover:shadow-lg`}
            >
              {/* --- NAGŁÓWEK (RESPONSYWNY) --- */}
              <div
                onClick={() => toggleMatch(gameId)}
                className="relative flex flex-col sm:flex-row items-center cursor-pointer min-h-[7rem] sm:h-28 py-4 sm:py-0"
              >
                {/* Pasek koloru */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${stripColor}`}></div>

                {/* 1. Info o meczu (Typ, data, wynik) */}
                <div className="w-full sm:w-28 pl-6 sm:pl-4 mb-3 sm:mb-0 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-start text-xs text-gray-600 sm:space-y-1 border-b sm:border-b-0 border-gray-200 pb-2 sm:pb-0">
                  <div className="text-left">
                    <p className={`font-bold text-sm ${textColor}`}>{getQueueName(match.info.queueId)}</p>
                    <p>{new Date(match.info.gameEndTimestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right sm:text-left">
                     <p className={`font-bold text-base ${isWin ? "text-blue-600" : "text-red-600"}`}>
                        {isWin ? "Victory" : "Defeat"}
                     </p>
                     <p>{Math.floor(match.info.gameDuration / 60)}m {match.info.gameDuration % 60}s</p>
                  </div>
                </div>

                {/* 2. Postać i Statystyki */}
                {self && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 mx-4 w-full sm:w-auto justify-center">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${self.championName}_0.jpg`}
                            alt={self.championName}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-400"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded-full border border-gray-600">
                            {self.champLevel}
                        </span>
                        </div>

                        <div className="flex flex-col gap-1">
                        {[self.summoner1Id, self.summoner2Id].map((spellId, idx) => (
                            <img
                            key={idx}
                            src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/spell/${spellMap[spellId]}.png`}
                            alt="Spell"
                            className="w-6 h-6 rounded border border-gray-400 bg-black"
                            />
                        ))}
                        </div>
                    </div>

                    <div className="text-center sm:text-left sm:w-28">
                      <p className="font-bold text-gray-800 text-xl sm:text-lg leading-none">
                        {self.kills} / <span className="text-red-600">{self.deaths}</span> / {self.assists}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((self.kills + self.assists) / Math.max(1, self.deaths)).toFixed(2)}:1 KDA
                      </p>
                      {/* Odznaka AI (Grade) */}
                      {aiAnalysis && (
                        <span className={`inline-block mt-1 text-[10px] font-bold border px-1.5 rounded ${aiAnalysis.color} border-current`}>
                           Grade: {aiAnalysis.grade}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Itemy (Na mobile mogą się zawijać) */}
                <div className="flex-grow flex flex-wrap justify-center sm:justify-start items-center gap-1 sm:pl-4 sm:border-l border-gray-300/50 mt-3 sm:mt-0">
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
                  <div className="ml-0 sm:ml-2 w-8 h-8 rounded-full bg-gray-200 border border-gray-300 overflow-hidden">
                    {trinket !== 0 && (
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/item/${trinket}.png`}
                        alt="Trinket"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Strzałka rozwijania */}
                <div className="absolute right-4 bottom-2 sm:static sm:pr-6 text-gray-400 sm:text-gray-500">
                  {isExpanded ? <FaAngleUp size={20} /> : <FaAngleDown size={20} />}
                </div>
              </div>

              {/* --- SZCZEGÓŁY (Rozwijane) --- */}
              {isExpanded && (
                <div className="border-t border-gray-300 bg-white animate-fadeIn">
                  
                  {/* Sekcja AI */}
                  {aiAnalysis && (
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <h4 className="flex items-center gap-2 text-xl font-bold text-purple-400">
                           <FaRobot /> AI Analysis
                        </h4>
                        <div className="flex items-center gap-4 bg-gray-800/50 p-2 rounded-lg">
                           <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase">Score</p>
                              <p className={`text-2xl font-bold ${aiAnalysis.color}`}>{aiAnalysis.score}</p>
                           </div>
                           <div className={`text-3xl font-extrabold ${aiAnalysis.color} border-2 border-current w-12 h-12 flex items-center justify-center rounded-lg`}>
                              {aiAnalysis.grade}
                           </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                            {aiAnalysis.feedback.map((tip, index) => (
                               <div key={index} className="flex items-start gap-3 text-sm text-gray-300 bg-gray-700/30 p-2.5 rounded hover:bg-gray-700/50 transition">
                                  <span className="text-purple-400 mt-0.5"><FaMagic /></span>
                                  {tip}
                               </div>
                            ))}
                      </div>
                    </div>
                  )}

                  {/* Tabele Drużyn (Grid zmienia się na 1 kolumnę na mobile) */}
                  <div className="p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    <TeamList teamName="Blue Team" color="text-blue-600" participants={match.info.participants.filter(p => p.teamId === 100)} puuid={puuid} />
                    <TeamList teamName="Red Team" color="text-red-600" participants={match.info.participants.filter(p => p.teamId === 200)} puuid={puuid} />
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

// Pomocniczy komponent do listy drużyny (dla czystości kodu)
const TeamList = ({ teamName, color, participants, puuid }: { teamName: string, color: string, participants: ParticipantType[], puuid: string }) => (
    <div>
      <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${color} border-b border-gray-100 pb-1`}>{teamName}</h4>
      <div className="space-y-1">
        {participants.map((p, i) => (
           <ParticipantRow key={i} participant={p} puuid={puuid} />
        ))}
      </div>
    </div>
);

const ParticipantRow = ({ participant, puuid }: { participant: ParticipantType, puuid: string }) => {
  const isMe = participant.puuid === puuid;
  return (
    <div
      className={`flex items-center p-2 rounded transition-colors ${
        isMe ? "bg-yellow-50 border border-yellow-200 shadow-sm" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative mr-3">
        <img
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${participant.championName}_0.jpg`}
            alt={participant.championName}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover"
        />
      </div>
      
      <div className="flex-grow min-w-0 pr-2">
        <p className={`text-xs sm:text-sm truncate ${isMe ? "font-bold text-gray-900" : "text-gray-600"}`}>
          {participant.riotIdGameName}
        </p>
      </div>
      
      <div className="text-right">
        <div className="text-xs sm:text-sm font-medium text-gray-700">
            {participant.kills}/{participant.deaths}/{participant.assists}
        </div>
        <div className="text-[10px] text-gray-400">
            {participant.totalMinionsKilled} CS
        </div>
      </div>
    </div>
  );
};