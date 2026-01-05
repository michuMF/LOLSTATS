import { useState } from "react";
import type { MatchDetailsType, ParticipantType } from "../types/types";
import { 
  FaAngleDown, 
  FaAngleUp, 
  FaRobot, 
  FaFistRaised, 
  FaCoins, 
  FaEye, 
  FaChessRook, 
  FaBalanceScale, 
  FaUserFriends,
  FaTrophy
} from "react-icons/fa";
import { analyzeMatch } from "../utils/analyzeMatch";

// Mapa czarów przywoływacza (Summoner Spells)
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
    case 400: return "Draft Pick";
    case 430: return "Blind Pick";
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
    <div className="mt-8 w-full max-w-4xl mx-auto font-sans">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 pl-2 border-l-4 border-slate-800 flex items-center gap-2">
         Match History <span className="text-xs font-normal text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-0.5 rounded">AI 2.0 Enabled</span>
      </h3>
      
      <ul className="space-y-4">
        {matchDetails?.map((match) => {
          const self = match.info.participants.find((p) => p.puuid === puuid);
          const isWin = self?.win || false;
          const gameId = match.info.gameId;
          const isExpanded = expandedMatchId === gameId;

          // --- URUCHOMIENIE SILNIKA AI ---
          const ai = self 
            ? analyzeMatch(self, match.info.participants, match.info.gameDuration) 
            : null;

          // Style dla Karty (Clean UI)
          const borderClass = isWin ? "border-l-blue-500" : "border-l-red-500";
          const bgHover = isWin ? "hover:bg-blue-50/30" : "hover:bg-red-50/30";
          const badgeBg = isWin ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700";

          const items = [self?.item0, self?.item1, self?.item2, self?.item3, self?.item4, self?.item5];
          const trinket = self?.item6;

          return (
            <li
              key={gameId}
              className={`bg-white rounded-r-xl rounded-l-md shadow-sm border border-slate-200 border-l-[6px] ${borderClass} overflow-hidden transition-all duration-200 ${bgHover}`}
            >
              {/* --- 1. NAGŁÓWEK KARTY (Widoczny zawsze) --- */}
              <div
                onClick={() => toggleMatch(gameId)}
                className="flex flex-col sm:flex-row items-center cursor-pointer py-4 px-4 sm:px-6 gap-4"
              >
                {/* INFO: Typ, Wynik, Czas */}
                <div className="w-full sm:w-32 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-start text-xs text-slate-500">
                  <div className="text-left mb-1">
                    <p className="font-bold text-slate-700 text-sm">{getQueueName(match.info.queueId)}</p>
                    <p>{new Date(match.info.gameEndTimestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right sm:text-left">
                     <span className={`font-bold px-2 py-0.5 rounded text-xs ${badgeBg}`}>
                        {isWin ? "WIN" : "LOSS"}
                     </span>
                     <p className="mt-1 font-mono">{Math.floor(match.info.gameDuration / 60)}m {match.info.gameDuration % 60}s</p>
                  </div>
                </div>

                {/* POSTAĆ I STATYSTYKI */}
                {self && (
                  <div className="flex items-center gap-4 flex-grow justify-center sm:justify-start">
                    <div className="relative">
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${self.championName}_0.jpg`}
                            alt={self.championName}
                            className="w-14 h-14 rounded-lg object-cover shadow-sm border border-slate-300"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                            {self.champLevel}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        {[self.summoner1Id, self.summoner2Id].map((spellId, idx) => (
                            <img
                            key={idx}
                            src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/spell/${spellMap[spellId] || "SummonerFlash"}.png`}
                            alt="Spell"
                            className="w-6 h-6 rounded bg-slate-900"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://ddragon.leagueoflegends.com/cdn/15.20.1/img/spell/SummonerFlash.png" }}
                            />
                        ))}
                    </div>

                    <div className="ml-2 sm:ml-6 text-center sm:text-left min-w-[100px]">
                      <p className="text-xl font-bold text-slate-800 tracking-wide">
                        {self.kills} / <span className="text-red-500">{self.deaths}</span> / {self.assists}
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{((self.kills + self.assists) / Math.max(1, self.deaths)).toFixed(2)}:1</span> KDA
                      </p>
                      {/* Grade AI Badge */}
                      {ai && (
                        <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${ai.gradeColor.replace('text-', 'border-').replace('500', '200')} bg-slate-50 text-slate-600`}>
                           <FaRobot className={ai.gradeColor} /> Grade: <span className={ai.gradeColor}>{ai.grade}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ITEMY */}
                <div className="hidden sm:flex flex-wrap items-center gap-1 pl-4 border-l border-slate-100">
                  {items.map((itemId, idx) => (
                    <div key={idx} className="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden">
                      {itemId !== 0 && (
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/item/${itemId}.png`}
                          alt={`Item ${itemId}`}
                          className="w-full h-full object-cover opacity-90 hover:opacity-100"
                        />
                      )}
                    </div>
                  ))}
                  <div className="ml-2 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                    {trinket !== 0 && (
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/item/${trinket}.png`}
                        alt="Trinket"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* STRZAŁKA */}
                <div className="text-slate-400 pl-2">
                  {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                </div>
              </div>

              {/* --- 2. ROZWINIĘCIE (Nowe AI & Tabele) --- */}
              {isExpanded && (
                <div className="bg-slate-50 border-t border-slate-200 animate-in fade-in slide-in-from-top-1 duration-200">
                  
                  {/* SEKCJA AI - SZCZEGÓŁOWA */}
                  {ai && (
                    <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-slate-200">
                      
                      {/* LEWA KOLUMNA: Scoring Breakdown */}
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                <FaRobot className="text-slate-400" /> Analiza Wyniku
                            </h4>
                            <span className={`text-2xl font-black ${ai.gradeColor}`}>{ai.grade}</span>
                        </div>
                        
                        <div className="space-y-4">
                            <ScoreBar label="Combat (Walka)" score={ai.details.combatScore} icon={<FaFistRaised />} color="bg-red-500" />
                            <ScoreBar label="Income (Złoto/CS)" score={ai.details.incomeScore} icon={<FaCoins />} color="bg-amber-400" />
                            <ScoreBar label="Vision (Wizja)" score={ai.details.visionScore} icon={<FaEye />} color="bg-purple-500" />
                            <ScoreBar label="Objectives (Cele)" score={ai.details.objectiveScore} icon={<FaChessRook />} color="bg-blue-500" />
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Główna Porada</p>
                            <p className="text-sm text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-100">
                                "{ai.feedback[0] || "Solidna gra. Utrzymuj ten poziom!"}"
                            </p>
                        </div>
                      </div>

                      {/* PRAWA KOLUMNA: Kontekst (Draft & Lane) */}
                      <div className="space-y-4">
                        
                        {/* A. Draft Box */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold text-white rounded-bl-lg ${ai.draftAnalysis.winProbabilityModifier.includes('-') ? 'bg-red-500' : 'bg-green-500'}`}>
                                Win Prob: {ai.draftAnalysis.winProbabilityModifier}
                            </div>
                            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2 text-sm">
                                <FaBalanceScale /> Kompozycja (Draft)
                            </h4>
                            <p className="text-sm text-slate-600 mb-3">{ai.draftAnalysis.advice}</p>
                            {/* Pasek balansu DMG */}
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase">
                                <span>AD</span>
                                <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div className={`h-full transition-all duration-500 ${ai.draftAnalysis.isFullAD ? 'bg-red-500 w-full' : (ai.draftAnalysis.isFullAP ? 'bg-blue-500 w-full' : 'bg-gradient-to-r from-red-400 to-blue-400 w-full')}`}></div>
                                </div>
                                <span>AP</span>
                            </div>
                        </div>

                        {/* B. Lane Opponent Box */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                             <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                                <FaUserFriends /> Pojedynek na Linii
                            </h4>
                            <div className="flex items-center justify-around text-center">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Gold Diff</p>
                                    <p className={`font-bold text-lg ${ai.laneOpponentComparison.goldDiff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {ai.laneOpponentComparison.goldDiff > 0 ? '+' : ''}{(ai.laneOpponentComparison.goldDiff / 1000).toFixed(1)}k
                                    </p>
                                </div>
                                <div className="w-px h-8 bg-slate-100"></div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">CS Diff</p>
                                    <p className={`font-bold text-lg ${ai.laneOpponentComparison.csDiff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {ai.laneOpponentComparison.csDiff > 0 ? '+' : ''}{ai.laneOpponentComparison.csDiff}
                                    </p>
                                </div>
                                <div className="w-px h-8 bg-slate-100"></div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Wynik</p>
                                    {ai.laneOpponentComparison.winLane ? (
                                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1"><FaTrophy size={10}/> WIN</span>
                                    ) : (
                                        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">LOSE</span>
                                    )}
                                </div>
                            </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* LISTY DRUŻYN (Slate Style) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-px bg-slate-200">
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

// --- KOMPONENTY POMOCNICZE ---

// Pasek postępu dla oceny AI
const ScoreBar = ({ label, score, icon, color }: { label: string, score: number, icon: any, color: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-5 text-slate-400 flex justify-center">{icon}</div>
        <div className="flex-grow">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">{label}</span>
                <span className="font-bold text-slate-800">{score}/100</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-700 ease-out`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    </div>
);

const TeamList = ({ teamName, color, participants, puuid }: { teamName: string, color: string, participants: ParticipantType[], puuid: string }) => (
    <div className="bg-slate-50 p-4">
      <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${color} opacity-80 border-b border-slate-200 pb-1`}>{teamName}</h4>
      <div className="flex flex-col gap-1">
        {participants.map((p, i) => (
           <ParticipantRow key={i} participant={p} puuid={puuid} />
        ))}
      </div>
    </div>
);

const ParticipantRow = ({ participant, puuid }: { participant: ParticipantType, puuid: string }) => {
  const isMe = participant.puuid === puuid;
  
  // Wyróżnienie gracza (Clean Amber)
  const rowClass = isMe 
    ? "bg-amber-50 border border-amber-200 shadow-sm z-10" 
    : "hover:bg-slate-100 border border-transparent";

  return (
    <div className={`flex items-center p-1.5 rounded transition-all ${rowClass}`}>
      <div className="relative mr-3">
        <img
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${participant.championName}_0.jpg`}
            alt={participant.championName}
            className="w-8 h-8 rounded bg-slate-300 object-cover"
        />
      </div>
      
      <div className="flex-grow min-w-0 pr-2 flex flex-col justify-center">
        <div className="flex items-center gap-1">
            <span className={`text-xs truncate font-medium ${isMe ? "text-slate-900 font-bold" : "text-slate-600"}`}>
            {participant.riotIdGameName}
            </span>
        </div>
      </div>
      
      <div className="text-right flex items-center gap-3">
        <div className="text-xs text-slate-400 w-12 text-right">
            {participant.totalMinionsKilled} CS
        </div>
        <div className="text-xs font-mono w-16 text-right">
            <span className="text-slate-700 font-bold">{participant.kills}</span>/
            <span className="text-red-500">{participant.deaths}</span>/
            <span className="text-slate-500">{participant.assists}</span>
        </div>
      </div>
    </div>
  );
};