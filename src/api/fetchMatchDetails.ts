// src/api/fetchMatchDetails.ts
import { z } from "zod";
import { MatchDetailsSchema, ParticipantSchema } from "../schemas/matchSchemas";

// Eksportujemy typy wywnioskowane (choć lepiej używać tych z types/match/...)
export type MatchDetailsType = z.infer<typeof MatchDetailsSchema>;
export type ParticipantType = z.infer<typeof ParticipantSchema>;

export const fetchMatchDetails = async (matchId: string, region: string): Promise<MatchDetailsType> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/api/matches/details/${region}/${matchId}`);
  if (!response.ok) throw new Error("Failed to fetch match details");

  const rawData = await response.json();
  const result = MatchDetailsSchema.safeParse(rawData);

  if (!result.success) {
    console.error(`❌ ZOD VALIDATION ERROR w meczu ${matchId}:`, result.error.format());
    // W dev mode rzucamy błąd, w prod zwracamy co mamy
    if (import.meta.env.DEV) {
      console.warn("Zwracam surowe dane mimo błędu walidacji (DEV MODE)");
    }
    return rawData as MatchDetailsType;
  }

  return result.data;
};