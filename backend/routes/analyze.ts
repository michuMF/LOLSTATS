import { Router, Request, Response } from "express";
import { z } from "zod";
import { Match } from "../../src/types/match/Match";
import { analyzeMatchWithAI, prepareMatchForLLM } from "../services/aiService";

const router = Router();

const AnalyzeRequestSchema = z.object({
  matchData: z.custom<Match>((data) => {
    return typeof data === "object" && data !== null && "info" in data;
  }, "Nieprawidłowy format obiektu Match"),
  puuid: z.string().min(1, "PUUID jest wymagany"),
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // WALIDACJA WEJŚCIA (ZOD PARSE)
    const { matchData, puuid } = AnalyzeRequestSchema.parse(req.body);

    const matchSummary = prepareMatchForLLM(matchData, puuid);
    const analysis = await analyzeMatchWithAI(matchSummary);

    res.json({ analysis });
  } catch (error) {
    // Obsługa błędów Zoda
    if (error instanceof z.ZodError) {
      console.error("❌ Błąd Walidacji Zod:", error.issues);
      res.status(400).json({ error: "Nieprawidłowe dane wejściowe", details: error.issues });
    } else {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  }
});

export default router;
