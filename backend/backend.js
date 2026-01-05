import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // Załaduj zmienne środowiskowe z pliku .env

const app = express();

app.get("/api/summoner/:gameName/:tagLine", async (req, res) => {
  const { gameName, tagLine } = req.params;
  const apiKey = process.env.RIOT_API_KEY;

  try {
    const response = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));