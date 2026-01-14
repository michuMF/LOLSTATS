import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios'; 
import dotenv from 'dotenv';
import path from 'path';

// --- KONFIGURACJA .ENV ---
dotenv.config();

// Fallback dla zmiennych środowiskowych
if (!process.env.RIOT_API_KEY) {
    console.log("⚠️ Nie znaleziono .env w folderze bieżącym, szukam w folderze głównym...");
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

if (!process.env.RIOT_API_KEY) {
    console.error("❌ FATAL ERROR: Brak RIOT_API_KEY. Upewnij się, że masz plik .env!");
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL }));

// --- LOGIKA ---

const fetchRiot = async (url: string, res: Response) => {
    console.log(`📡 Fetching: ${url}`);
    try {
        const response = await axios.get(url, { 
            headers: { "X-Riot-Token": process.env.RIOT_API_KEY } 
        });
        res.json(response.data);
    } catch (error: any) {
        // Bezpieczna obsługa błędu bez importowania typów Axiosa
        if (error && error.response) {
            console.error(`❌ Riot API Error [${error.response.status}]:`, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`❌ Server Error: ${error.message || 'Unknown error'}`);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

// --- ENDPOINTY ---

// Helper: Funkcja do bezpiecznego wyciągania stringów z params
// Dzięki temu TypeScript wie, że to na pewno string, a nie tablica.
const getParam = (req: Request, key: string): string => {
    const value = req.params[key];
    return String(value); // Wymuszamy konwersję na string
};

app.get('/api/account/:region/:gameName/:tagLine', (req: Request, res: Response) => {
    // Używamy helpera lub rzutowania "as string"
    const region = req.params.region as string;
    const gameName = req.params.gameName as string;
    const tagLine = req.params.tagLine as string;

    // Logika wyboru routingu (uproszczona dla czytelności)
    const regionLower = region.toLowerCase(); 
    let routing = 'europe';
    if (['na', 'br', 'lan', 'las'].includes(regionLower)) routing = 'americas';
    if (['kr', 'jp'].includes(regionLower)) routing = 'asia';
    
    const url = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    fetchRiot(url, res);
});

app.get('/api/summoner/:region/:puuid', (req: Request, res: Response) => {
    const region = req.params.region as string;
    const puuid = req.params.puuid as string;

    const platformMap: Record<string, string> = {
        'euw': 'euw1', 'eune': 'eun1', 'na': 'na1', 'kr': 'kr', 
        'tr': 'tr1', 'ru': 'ru', 'jp': 'jp1', 'br': 'br1', 
        'lan': 'la1', 'las': 'la2', 'oce': 'oc1'
    };
    const platform = platformMap[region.toLowerCase()] || 'euw1';

    const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    fetchRiot(url, res);
});

app.get('/api/ranked/:region/:puuid', (req: Request, res: Response) => {
    const region = req.params.region as string;
    const puuid = req.params.puuid as string;

    const platformMap: Record<string, string> = {
        'euw': 'euw1', 'eune': 'eun1', 'na': 'na1', 'kr': 'kr',
        'tr': 'tr1', 'ru': 'ru', 'jp': 'jp1', 'br': 'br1', 
        'lan': 'la1', 'las': 'la2', 'oce': 'oc1'
    };
    const platform = platformMap[region.toLowerCase()] || 'euw1';

    const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
    fetchRiot(url, res);
});

app.get('/api/matches/ids/:region/:puuid', (req: Request, res: Response) => {
    const region = req.params.region as string;
    const puuid = req.params.puuid as string;

    let routing = 'europe';
    const rLower = region.toLowerCase();
    if (['na', 'br', 'lan', 'las'].includes(rLower)) routing = 'americas';
    if (['kr', 'jp'].includes(rLower)) routing = 'asia';
    if (['oce', 'ph', 'sg', 'th', 'tw', 'vn'].includes(rLower)) routing = 'sea';
    
    const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`;
    fetchRiot(url, res);
});

app.get('/api/matches/details/:region/:matchId', (req: Request, res: Response) => {
    const region = req.params.region as string;
    const matchId = req.params.matchId as string;

    let routing = 'europe';
    const rLower = region.toLowerCase();
    if (['na', 'br', 'lan', 'las'].includes(rLower)) routing = 'americas';
    if (['kr', 'jp'].includes(rLower)) routing = 'asia';
    if (['oce', 'ph', 'sg', 'th', 'tw', 'vn'].includes(rLower)) routing = 'sea';
    
    const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    fetchRiot(url, res);
});

app.get('/api/spectator/:region/:puuid', (req: Request, res: Response) => {
    const region = req.params.region as string;
    const puuid = req.params.puuid as string;

    const platformMap: Record<string, string> = { 
        'euw': 'euw1', 'eune': 'eun1', 'na': 'na1', 'kr': 'kr',
        'tr': 'tr1', 'ru': 'ru', 'jp': 'jp1', 'br': 'br1', 
        'lan': 'la1', 'las': 'la2', 'oce': 'oc1'
    };
    const platform = platformMap[region.toLowerCase()] || 'euw1';
    
    const url = `https://${platform}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;
    fetchRiot(url, res);
});

app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`🔧 Allowed CORS Origin: ${CLIENT_URL}`);
});