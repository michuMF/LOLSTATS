import { Link, useParams } from "react-router-dom";
import type { ParticipantType } from "../types";




const ParticipantRow = ({ participant, puuid }: { participant: ParticipantType, puuid: string }) => {
  const isMe = participant.puuid === puuid;

  const { region } = useParams<{ region: string }>();
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
      <div className="flex-grow ...">
        <div className="flex items-center gap-1">
            {/* ZMIANA: Link zamiast spana */}
            <Link 
              to={`/profile/${region}/${participant.riotIdGameName}/${participant.riotIdTagline}`}
              target="_blank" // Otwórz w nowej karcie (zgodnie z prośbą)
              className={`text-xs truncate font-medium hover:text-blue-600 hover:underline ${isMe ? "text-slate-900 font-bold" : "text-slate-600"}`}
            >
              {participant.riotIdGameName}
            </Link>
            <span className="text-[10px] text-slate-400">#{participant.riotIdTagline}</span>
        </div>
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

export const TeamList = ({ teamName, color, participants, puuid }: { teamName: string, color: string, participants: ParticipantType[], puuid: string }) => (
    <div className="bg-slate-50 p-4">
      <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${color} opacity-80 border-b border-slate-200 pb-1`}>{teamName}</h4>
      <div className="flex flex-col gap-1">
        {participants.map((p, i) => (
           <ParticipantRow key={i} participant={p} puuid={puuid} />
        ))}
      </div>
    </div>
);