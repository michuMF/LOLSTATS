// src/SearchBar/MatchDetails.tsx
import React from 'react';
import type { MatchDetailsType } from '../types/types';
import { analyzeMatch } from '../utils/analyzeMatch';

interface MatchDetailsProps {
    match: MatchDetailsType;
    currentPuuid: string; // Potrzebne, żeby wiedzieć, który gracz to "TY"
}

const MatchDetails: React.FC<MatchDetailsProps> = ({ match, currentPuuid }) => {
    // 1. Znajdź uczestnika, który odpowiada aktualnie przeglądanemu profilowi
    const participant = match.info.participants.find(p => p.puuid === currentPuuid);

    if (!participant) {
        return <div className="text-white">Nie znaleziono danych gracza w tym meczu.</div>;
    }

    // 2. Uruchom "AI" do analizy
    // UWAGA: Upewnij się, że zaktualizowałeś analyzeMatch.ts zgodnie z moją poprzednią poradą,
    // aby przyjmowało (participant, allParticipants, duration).
    const analysis = analyzeMatch(participant, match.info.participants, match.info.gameDuration);

    // Obliczenia pomocnicze do wyświetlania
    const gameDurationMinutes = Math.floor(match.info.gameDuration / 60);
    const gameDurationSeconds = match.info.gameDuration % 60;
    const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
    const csPerMin = (cs / (match.info.gameDuration / 60)).toFixed(1);

    // Kolor tła w zależności od wyniku
    const bgColor = participant.win ? "bg-blue-900/30 border-blue-500/50" : "bg-red-900/30 border-red-500/50";
    const resultText = participant.gameEndedInEarlySurrender ? "Remake" : (participant.win ? "Zwycięstwo" : "Porażka");

    return (
        <div className={`flex flex-col md:flex-row items-center justify-between p-4 mb-4 rounded-lg border ${bgColor} text-white shadow-lg transition-all hover:scale-[1.01]`}>
            
            {/* LEWA STRONA: Informacje ogólne */}
            <div className="flex items-center gap-4 w-full md:w-1/3">
                <div className="relative">
                    <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${participant.championName}.png`} 
                        alt={participant.championName}
                        className="w-16 h-16 rounded-full border-2 border-gray-600"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-gray-800 text-xs px-1 rounded text-gray-300">
                        {participant.champLevel}
                    </span>
                </div>
                <div>
                    <h3 className={`font-bold text-lg ${participant.win ? "text-blue-300" : "text-red-400"}`}>
                        {resultText}
                    </h3>
                    <p className="text-gray-400 text-sm">{match.info.gameMode}</p>
                    <p className="text-gray-500 text-xs">{gameDurationMinutes}m {gameDurationSeconds}s</p>
                </div>
            </div>

            {/* ŚRODEK: Statystyki (KDA, CS, Items) */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/3 my-2 md:my-0">
                <div className="text-xl font-bold tracking-wider">
                    {participant.kills} / <span className="text-red-500">{participant.deaths}</span> / {participant.assists}
                </div>
                <div className="text-sm text-gray-400 mb-2">
                    KDA: <span className="text-gray-200">{((participant.kills + participant.assists) / Math.max(1, participant.deaths)).toFixed(2)}</span>
                </div>
                
                <div className="flex gap-2 text-xs text-gray-400">
                    <span title="Creep Score">CS: {cs} ({csPerMin})</span>
                    <span title="Vision Score">Vis: {participant.visionScore}</span>
                </div>

                {/* Itemy */}
                <div className="flex gap-1 mt-2">
                    {[participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5].map((item, idx) => (
                        <div key={idx} className="w-6 h-6 bg-gray-800 rounded border border-gray-700 overflow-hidden">
                            {item !== 0 && (
                                <img 
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/item/${item}.png`} 
                                    alt="Item" 
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* PRAWA STRONA: Analiza AI */}
            <div className="flex flex-col items-end w-full md:w-1/3 pl-4 border-l border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Ocena Gry</p>
                        <p className={`text-2xl font-black ${analysis.gradeColor}`}>{analysis.grade}</p>
                    </div>
                    <div className={`text-xl font-bold ${analysis.gradeColor}`}>
                        {analysis.totalScore}/100
                    </div>
                </div>

                {/* Feedback - wyświetlamy max 2 najważniejsze porady */}
                <div className="text-xs text-right space-y-1 w-full">
                    {analysis.feedback.slice(0, 2).map((tip, index) => (
                        <p key={index} className="text-gray-300 bg-black/20 px-2 py-1 rounded inline-block ml-auto">
                            {tip}
                        </p>
                    ))}
                    {analysis.feedback.length === 0 && (
                        <p className="text-gray-500">Brak uwag. Solidna gra.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchDetails;