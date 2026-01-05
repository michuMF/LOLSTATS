import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors({
    origin: 'http://localhost:5173'
}));

// DIAGNOSTYKA: Sprawdź czy klucz jest widoczny
const API_KEY = process.env.RIOT_API_KEY;
if (!API_KEY) {
    console.error("❌ BŁĄD KRYTYCZNY: Nie znaleziono RIOT_API_KEY w pliku .env!");
} else {
    console.log(`✅ Klucz API załadowany: ${API_KEY.substring(0, 5)}... (wygląda poprawnie)`);
}

const BASE_URL_EU = "https://europe.api.riotgames.com";
const BASE_URL_EUN1 = "https://euw1.api.riotgames.com";

const fetchRiot = async (url, res) => {
    console.log(`📡 Próba połączenia z: ${url}`); // LOGUJEMY ADRES
    try {
        const response = await axios.get(url, {
            headers: { "X-Riot-Token": API_KEY }
        });
        console.log("✅ Sukces!");
        res.json(response.data);
    } catch (error) {
        // Lepsze logowanie błędu
        if (error.response) {
            // Serwer odpowiedział kodem błędu (np. 403, 404)
            console.error(`❌ Błąd API Riot (${error.response.status}):`, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // Nie otrzymano odpowiedzi (problem z siecią)
            console.error("❌ Brak odpowiedzi od Riot (Błąd sieci/DNS):", error.message);
            res.status(503).json({ error: "Network Error - No response from Riot" });
        } else {
            // Inny błąd
            console.error("❌ Błąd konfiguracji zapytania:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
};

app.get('/api/account/:gameName/:tagLine', (req, res) => {
    const { gameName, tagLine } = req.params;
    // Sprawdzamy czy frontend nie wysyła "undefined" jako tekstu
    if (gameName === 'undefined' || tagLine === 'undefined') {
        console.error("⚠️ Frontend wysyła błędne dane: gameName/tagLine jest undefined!");
        return res.status(400).json({ error: "Invalid parameters" });
    }
    const url = `${BASE_URL_EU}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    fetchRiot(url, res);
});

app.get('/api/summoner/:puuid', (req, res) => {
    const { puuid } = req.params;
    const url = `${BASE_URL_EUN1}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    fetchRiot(url, res);
});

app.get('/api/ranked/:summonerId', (req, res) => {
    const { summonerId } = req.params;
    const url = `${BASE_URL_EUN1}/lol/league/v4/entries/by-summoner/${summonerId}`;
    fetchRiot(url, res);
});

app.get('/api/matches/ids/:puuid', (req, res) => {
    const { puuid } = req.params;
    const url = `${BASE_URL_EU}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`;
    fetchRiot(url, res);
});

app.get('/api/matches/details/:matchId', (req, res) => {
    const { matchId } = req.params;
    const url = `${BASE_URL_EU}/lol/match/v5/matches/${matchId}`;
    fetchRiot(url, res);
});

app.listen(PORT, () => {
    console.log(`🚀 Backend działa na porcie ${PORT}`);
});