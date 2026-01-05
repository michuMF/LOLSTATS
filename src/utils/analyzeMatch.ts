// src/utils/analyzeMatch.ts
import type { ParticipantType } from "../types/types";

interface AnalysisResult {
  score: number; // 0 - 100
  grade: string; // S, A, B, C, D
  feedback: string[]; // Lista porad
  color: string; // Kolor oceny
}

export const analyzeMatch = (participant: ParticipantType, gameDuration: number): AnalysisResult => {
  let score = 50; // Zaczynamy od bazy 50 punktów
  const feedback: string[] = [];

  // --- 1. Podstawowe dane ---
  const minutes = gameDuration / 60;
  const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
  const csPerMin = cs / minutes;
  const kda = (participant.kills + participant.assists) / Math.max(1, participant.deaths);
  const visionScore = participant.visionScore;
  const visionPerMin = visionScore / minutes;

  // --- 2. Algorytm Oceniania (Logika AI) ---

  // Bonus za wygraną
  if (participant.win) {
    score += 10;
    feedback.push("Dobra robota! Wygrana to najważniejsza statystyka.");
  } else {
    score -= 5;
    feedback.push("Mecz przegrany, ale sprawdźmy Twoje indywidualne błędy.");
  }

  // Analiza KDA
  if (kda > 5) {
    score += 20;
    feedback.push("Świetne KDA! Grałeś bardzo bezpiecznie i skutecznie.");
  } else if (kda > 3) {
    score += 10;
    feedback.push("Solidne KDA.");
  } else if (kda < 1.5) {
    score -= 15;
    feedback.push("Twoje KDA jest bardzo niskie. Unikaj niepotrzebnych śmierci.");
  }

  // Analiza Śmierci (Kluczowe!)
  if (participant.deaths > 8) {
    score -= 10;
    feedback.push(`Umarłeś aż ${participant.deaths} razy. To oddaje dużo złota przeciwnikowi.`);
  } else if (participant.deaths === 0) {
    score += 10;
    feedback.push("Perfekcyjna gra! Zero śmierci.");
  }

  // Analiza Farmy (CS/min) - Pomiń to jeśli to Support (zakładamy po itemie supporta)
  // (Uproszczenie: sprawdzamy czy ma mniej niż 20 CS w 20 minucie, wtedy pewnie support)
  const isSupport = csPerMin < 2 && participant.role === "SUPPORT";
  
  if (!isSupport) {
    if (csPerMin > 8) {
      score += 20;
      feedback.push(`Znakomita farma: ${csPerMin.toFixed(1)} CS/min.`);
    } else if (csPerMin > 6) {
      score += 10;
    } else if (csPerMin < 4) {
      score -= 15;
      feedback.push(`Bardzo słaba farma (${csPerMin.toFixed(1)}/min). Ćwicz last-hitowanie!`);
    }
  } else {
    // Logika dla Supporta (Wizja jest ważniejsza)
    if (visionPerMin > 1.5) {
      score += 15;
      feedback.push("Świetna kontrola wizji!");
    } else if (visionPerMin < 0.5) {
      score -= 10;
      feedback.push("Jako support musisz stawiać więcej wardów.");
    }
  }

  // Analiza Wkładu (Kill Participation) - tutaj uproszczone, bo nie mamy total kills teamu
  // Można by to dodać, jeśli przekażesz dane o całej drużynie.
  
  // --- 3. Normalizacja Wyniku (żeby nie wyszło ponad 100 lub poniżej 0) ---
  score = Math.min(100, Math.max(0, Math.round(score)));

  // --- 4. Wystawianie Oceny Literowej ---
  let grade = "D";
  let color = "text-red-600";
  if (score >= 90) { grade = "SSS"; color = "text-yellow-500"; }
  else if (score >= 80) { grade = "S"; color = "text-blue-500"; }
  else if (score >= 70) { grade = "A"; color = "text-green-500"; }
  else if (score >= 50) { grade = "B"; color = "text-teal-500"; }
  else if (score >= 30) { grade = "C"; color = "text-orange-500"; }

  return { score, grade, feedback, color };
};