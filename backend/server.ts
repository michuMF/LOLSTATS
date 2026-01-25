import express from 'express';
import cors from 'cors';
import { Ollama } from 'ollama';
import { prepareMatchForLLM } from './utils/aiDataMapper'; // (To stworzymy w Kroku 2)


const app = express();
const PORT = 3001; // Inny port niż React (zazwyczaj 5173)

// Inicjalizacja klienta Ollama (domyślnie localhost:11434)
const ollama = new Ollama();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Match JSON potrafi być duży

// Endpoint dla Frontend
app.post('/api/analyze-match', async (req, res) => {
  try {
    const { matchData, puuid } = req.body;

    if (!matchData || !puuid) {
      return res.status(400).json({ error: 'Missing matchData or puuid' });
    }

    // 1. Przygotowanie danych (Pruning)
    // Nie wysyłamy całego JSON-a (jest za duży i szumi modelowi)
    const matchSummary = prepareMatchForLLM(matchData, puuid);

    // 2. Prompt Engineering
    const prompt = `
      Jesteś profesjonalnym analitykiem League of Legends (Challenger Tier).
      Przeanalizuj poniższy mecz gracza grającego postacią ${matchSummary.champion}.
      
      STATYSTYKI GRACZA:
      ${JSON.stringify(matchSummary, null, 2)}
      
      ZADANIE:
      Na podstawie statystyk, ekonomii i buildu, wskaż 3 konkretne rzeczy, 
      które zadecydowały o wyniku. Bądź zwięzły, surowy i konkretny.
      Nie pisz ogólników typu "farm więcej". Odnoś się do liczb.
    `;

    // 3. Wywołanie Ollama (Streaming dla szybszego UX)
    // Używamy modelu 'llama3' (musi być wcześniej ściągnięty: `ollama pull llama3`)
    const response = await ollama.chat({
      model: 'llama3', // lub 'mistral'
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ analysis: response.message.content });

  } catch (error) {
    console.error('Ollama Error:', error);
    res.status(500).json({ error: 'Failed to analyze match' });
  }
});

app.listen(PORT, () => {
  console.log(`AI Server running on http://localhost:${PORT}`);
});