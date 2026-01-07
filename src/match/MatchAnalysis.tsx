import { FaRobot, FaFistRaised, FaCoins, FaEye, FaChessRook, FaBalanceScale, FaUserFriends, FaTrophy } from "react-icons/fa";

// Pomocniczy komponent paska (możesz go też wydzielić do oddzielnego pliku, jeśli chcesz)
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

export const MatchAnalysis = ({ ai }: { ai: any }) => {
  if (!ai) return null;

  return (
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
  );
};