import { Match } from '../../src/types/match/Match';

// Interfejs tego, co widzi AI (Strict Typing!)
interface AiMatchSummary {
  result: 'VICTORY' | 'DEFEAT';
  champion: string;
  role: string;
  kda: string;
  goldPerMinute: number;
  damageShare: string; // % udziału w obrażeniach teamu
  visionScore: number;
  csPerMinute: number;
  items: number[]; // Tutaj lepiej byłoby zamienić na string[] nazw przedmiotów
  enemyLaner: {
    champion: string;
    kda: string;
    goldEarned: number;
  } | null;
}

export const prepareMatchForLLM = (match: Match, targetPuuid: string): AiMatchSummary => {
  const participant = match.info.participants.find((p) => p.puuid === targetPuuid);
  
  if (!participant) {
    throw new Error('Player not found in match data');
  }

  // Obliczenia statystyk drużynowych do kontekstu
  const myTeam = match.info.participants.filter((p) => p.teamId === participant.teamId);
  const totalTeamDamage = myTeam.reduce((sum, p) => sum + p.totalDamageDealtToChampions, 0);
  
  // Szukanie przeciwnika na linii (prosta heurystyka po roli)
  const enemyLaner = match.info.participants.find(
    (p) => p.teamId !== participant.teamId && p.teamPosition === participant.teamPosition
  );

  const gameDurationMin = match.info.gameDuration / 60;

  return {
    result: participant.win ? 'VICTORY' : 'DEFEAT',
    champion: participant.championName,
    role: participant.teamPosition,
    kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
    goldPerMinute: Math.round(participant.goldEarned / gameDurationMin),
    damageShare: `${((participant.totalDamageDealtToChampions / totalTeamDamage) * 100).toFixed(1)}%`,
    visionScore: participant.visionScore,
    csPerMinute: parseFloat(((participant.totalMinionsKilled + participant.neutralMinionsKilled) / gameDurationMin).toFixed(1)),
    items: [
      participant.item0, participant.item1, participant.item2,
      participant.item3, participant.item4, participant.item5
    ].filter(id => id !== 0), // Usuwamy puste sloty
    enemyLaner: enemyLaner ? {
      champion: enemyLaner.championName,
      kda: `${enemyLaner.kills}/${enemyLaner.deaths}/${enemyLaner.assists}`,
      goldEarned: enemyLaner.goldEarned
    } : null
  };
};