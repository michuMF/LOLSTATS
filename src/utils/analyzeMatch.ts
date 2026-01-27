// src/utils/analyzeMatch.ts

import type { ParticipantType } from "../api/fetchMatchDetails";

interface AnalysisResult {
  totalScore: number;
  grade: string;
  gradeColor: string;
  tags: string[]; // Np. "Lane Kingdom", "Passive Play"
  feedback: string[];
  details: {
    combatScore: number;
    incomeScore: number;
    visionScore: number;
    objectiveScore: number;
  };
  draftAnalysis: {
    isFullAD: boolean;
    isFullAP: boolean;
    damageBalanceScore: number; // 0-100
    winProbabilityModifier: string; // Np. "-5% (Bad Draft)"
    advice: string;
  };
  laneOpponentComparison: {
    winLane: boolean;
    goldDiff: number;
    csDiff: number;
    xpDiff: number;
  };
}

export const analyzeMatch = (
  player: ParticipantType,
  allParticipants: ParticipantType[],
  gameDuration: number
): AnalysisResult => {
  const minutes = gameDuration / 60;
  const feedback: string[] = [];
  const tags: string[] = [];

  // --- 1. ZNAJDŹ PRZECIWNIKA NA LINII (Head-to-Head) ---
  const enemyTeam = allParticipants.filter((p) => p.teamId !== player.teamId);
  const myTeam = allParticipants.filter((p) => p.teamId === player.teamId);

  // Próbujemy znaleźć rywala na tej samej pozycji
  const laneOpponent =
    enemyTeam.find((p) => p.teamPosition === player.teamPosition) || enemyTeam[0];

  const goldDiff = player.goldEarned - laneOpponent.goldEarned;
  const csDiff =
    player.totalMinionsKilled +
    player.neutralMinionsKilled -
    (laneOpponent.totalMinionsKilled + laneOpponent.neutralMinionsKilled);
  const xpDiff = player.champExperience - laneOpponent.champExperience;
  const winLane = goldDiff > 500; // Zakładamy wygraną linię przy przewadze 500g

  // --- 2. ANALIZA DRAFTU (Kompozycja Teamu) ---
  // Sprawdzamy profil obrażeń całej drużyny
  const teamPhysDmg = myTeam.reduce((acc, p) => acc + p.physicalDamageDealtToChampions, 0);
  const teamMagicDmg = myTeam.reduce((acc, p) => acc + p.magicDamageDealtToChampions, 0);
  const teamTrueDmg = myTeam.reduce((acc, p) => acc + p.trueDamageDealtToChampions, 0);
  const totalTeamDmg = teamPhysDmg + teamMagicDmg + teamTrueDmg;

  const physRatio = totalTeamDmg > 0 ? teamPhysDmg / totalTeamDmg : 0;
  const magicRatio = totalTeamDmg > 0 ? teamMagicDmg / totalTeamDmg : 0;

  const isFullAD = physRatio > 0.8;
  const isFullAP = magicRatio > 0.8;

  let draftScore = 50; // Baza
  let draftAdvice = "Zbalansowany skład.";
  let winProbMod = "0%";

  if (isFullAD) {
    draftScore = 20;
    draftAdvice = "FULL AD TEAM! Przeciwnik łatwo kontruje was pancerzem (Armor).";
    winProbMod = "-15%";
    feedback.push("Przegraliście w drafcie: Zbyt dużo obrażeń fizycznych (Full AD).");
  } else if (isFullAP) {
    draftScore = 30;
    draftAdvice = "FULL AP TEAM! Rywale zbudowali odporność na magię.";
    winProbMod = "-10%";
    feedback.push("Ryzykowny draft: Zbyt dużo magii, brak obrażeń stałych (DPS).");
  } else {
    draftScore = 80;
    draftAdvice = "Dobry balans obrażeń (AD/AP Mix).";
    winProbMod = "+5%";
  }

  // --- 3. OCENA INDYWIDUALNA (4 FILARY) ---

  // A. COMBAT (KDA, DPM, Kill Participation)
  const kp = (player.challenges?.killParticipation || 0) * 100; // np. 0.55 -> 55%
  const kdaRatio = (player.kills + player.assists) / Math.max(1, player.deaths);
  const damageShare = (player.challenges?.teamDamagePercentage || 0) * 100;

  let combatScore = 50;
  if (kdaRatio > 3) combatScore += 10;
  if (kdaRatio > 5) combatScore += 10;
  if (kp > 50) combatScore += 10;
  if (kp > 65) combatScore += 10;
  if (damageShare > 25) combatScore += 15; // Carry
  if (player.deaths > 8) combatScore -= 20; // Feeding

  // B. INCOME (CS, Gold vs Opponent)
  let incomeScore = 50;
  const csPerMin = (player.totalMinionsKilled + player.neutralMinionsKilled) / minutes;

  if (player.role !== "SUPPORT") {
    if (csPerMin > 7) incomeScore += 10;
    if (csPerMin > 9) incomeScore += 20;
    if (goldDiff > 1000)
      incomeScore += 20; // Zmiażdżył rywala
    else if (goldDiff < -1000) incomeScore -= 20; // Został zmiażdżony
  } else {
    // Dla supporta liczy się item supporta i gold ogólny
    incomeScore = 80; // Dajemy kredyt zaufania supportom
    if (goldDiff < -1000) incomeScore -= 10;
  }

  // C. VISION (Wardy, Control Wardy)
  let visionScore = 50;
  const visPerMin = player.visionScore / minutes;
  if (visPerMin > 1.5) visionScore += 20;
  else if (visPerMin < 0.5) visionScore -= 20;
  if (player.visionWardsBoughtInGame > 1) visionScore += 10;

  // D. OBJECTIVES (Turrets, Drakes - jeśli Jungle)
  let objectiveScore = 50;
  if (player.damageDealtToTurrets > 2000) objectiveScore += 20;
  if (player.dragonKills + player.baronKills > 0) objectiveScore += 10;
  if (player.firstTowerKill || player.firstTowerAssist) objectiveScore += 10;

  // --- 4. WYNIK KOŃCOWY ---
  // Ważymy oceny w zależności od roli
  let totalScore = 0;
  if (player.role === "SUPPORT") {
    totalScore = combatScore * 0.3 + visionScore * 0.4 + objectiveScore * 0.2 + incomeScore * 0.1;
  } else if (player.teamPosition === "JUNGLE") {
    totalScore = combatScore * 0.3 + objectiveScore * 0.4 + visionScore * 0.1 + incomeScore * 0.2;
  } else {
    // Laners
    totalScore = combatScore * 0.4 + incomeScore * 0.4 + objectiveScore * 0.1 + visionScore * 0.1;
  }

  // Bonus za wygranie linii
  if (winLane) {
    totalScore += 5;
    tags.push("Lane Kingdom");
    feedback.push(`Wygrałeś linię! (+${(goldDiff / 1000).toFixed(1)}k golda przewagi).`);
  } else if (goldDiff < -800) {
    feedback.push(
      `Przegrałeś linię z ${laneOpponent.championName} (-${Math.abs(goldDiff)} złota).`
    );
  }

  totalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Wyznaczanie oceny literowej
  let grade = "C";
  let gradeColor = "text-slate-500";
  if (totalScore >= 95) {
    grade = "SSS";
    gradeColor = "text-yellow-500";
  } else if (totalScore >= 85) {
    grade = "S";
    gradeColor = "text-blue-500";
  } else if (totalScore >= 75) {
    grade = "A";
    gradeColor = "text-emerald-500";
  } else if (totalScore >= 60) {
    grade = "B";
    gradeColor = "text-teal-500";
  } else if (totalScore >= 45) {
    grade = "C";
    gradeColor = "text-orange-500";
  } else {
    grade = "D";
    gradeColor = "text-red-500";
  }

  return {
    totalScore,
    grade,
    gradeColor,
    tags,
    feedback,
    details: {
      combatScore: Math.round(combatScore),
      incomeScore: Math.round(incomeScore),
      visionScore: Math.round(visionScore),
      objectiveScore: Math.round(objectiveScore),
    },
    draftAnalysis: {
      isFullAD,
      isFullAP,
      damageBalanceScore: draftScore,
      winProbabilityModifier: winProbMod,
      advice: draftAdvice,
    },
    laneOpponentComparison: {
      winLane,
      goldDiff,
      csDiff,
      xpDiff,
    },
  };
};
