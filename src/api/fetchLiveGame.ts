import { LiveGameInfoSchema, type LiveGameDTO, type LiveParticipantDTO } from "../types/live-game";
export type { LiveGameDTO, LiveParticipantDTO };

export const fetchLiveGame = async (puuid: string, region: string): Promise<LiveGameDTO | null> => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Zakładam endpoint: /api/spectator/{region}/{puuid}
  const response = await fetch(`${apiUrl}/api/spectator/${region}/${puuid}`);

  if (response.status === 404) {
    return null; // Gracz nie jest w grze
  }

  if (!response.ok) {
    throw new Error("Failed to fetch live game data");
  }

  const rawData = await response.json();

  // Walidacja Zod
  const result = LiveGameInfoSchema.safeParse(rawData);

  if (!result.success) {
    console.error("❌ ZOD ERROR (Live Game):", result.error.format());
    return rawData as LiveGameDTO; // Fallback
  }

  return result.data;
};