import React, { useState } from 'react';
import type { Match } from '../types/match/Match';

interface MatchAnalysisProps {
  match: Match;
  puuid: string;
}

const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ match, puuid }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    // --- DEBUGOWANIE ---
    console.log("🔍 Próba analizy meczu:");
    console.log("Match ID:", match?.metadata?.matchId);
    console.log("PUUID:", puuid);
    // -------------------

    if (!match || !puuid) {
      setError("Błąd wewnętrzny: Brakuje ID meczu lub PUUID gracza.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/analyze-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchData: match,
          puuid: puuid,
        }),
      });

      // Czytamy treść błędu z serwera, zamiast tylko statusu 400
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Błąd serwera: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err: unknown) {
      console.error("Błąd analizy:", err);
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-[#1a1c21] rounded-lg border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
          🤖 AI Coach
        </h3>
        {!analysis && (
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-bold text-white transition-all ${isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-md'
              }`}
          >
            {isLoading ? 'Analizowanie...' : 'Analizuj Mecz'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-sm mb-3">
          🛑 {error}
        </div>
      )}

      {analysis && (
        <div className="animate-fade-in">
          <div className="prose prose-invert max-w-none text-gray-300 bg-gray-900/50 p-4 rounded border border-gray-700 whitespace-pre-wrap leading-relaxed">
            {analysis}
          </div>
          <button
            onClick={() => setAnalysis(null)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-300 underline"
          >
            Zamknij
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchAnalysis;