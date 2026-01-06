import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors({ origin: 'http://localhost:5173' }));

const API_KEY = process.env.RIOT_API_KEY;

// --- MAPA REGIONÓW ---
// Tłumaczy wybór użytkownika na routing Riotu
const REGION_MAP = {
    'EUW': { platform: 'euw1', region: 'europe' },
    'EUNE': { platform: 'eun1', region: 'europe' },
    'NA': { platform: 'na1', region: 'americas' },
    'KR': { platform: 'kr', region: 'asia' },
    'BR': { platform: 'br1', region: 'americas' },
    'LAN': { platform: 'la1', region: 'americas' },
    'LAS': { platform: 'la2', region: 'americas' },
    'OCE': { platform: 'oc1', region: 'sea' }, // SEA/Americas zależnie od endpointu, ale routing match-v5 dla OCE to 'sea' lub 'americas' (Riot zmieniał, bezpiecznie: 'sea')
    'TR': { platform: 'tr1', region: 'europe' },
    'RU': { platform: 'ru', region: 'europe' },
    'JP': { platform: 'jp1', region: 'asia' },
};

// Funkcja pomocnicza do pobierania konfiguracji
const getRegionConfig = (regionCode) => {
    const config = REGION_MAP[regionCode.toUpperCase()];
    if (!config) throw new Error("Invalid Region");
    return config;
};

const fetchRiot = async (url, res) => {
    console.log(`📡 Fetching: ${url}`);
    try {
        const response = await axios.get(url, { headers: { "X-Riot-Token": API_KEY } });
        res.json(response.data);
    } catch (error) {
        console.error(`❌ Riot API Error: ${error.message}`);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

// --- ENDPOINTY Z OBSŁUGĄ REGIONU ---

// 1. KONTO (wymaga Regional Routing np. europe)
app.get('/api/account/:region/:gameName/:tagLine', (req, res) => {
    try {
        const { region, gameName, tagLine } = req.params;
        const { region: regionalRoute } = getRegionConfig(region);
        
        const url = `https://${regionalRoute}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
        fetchRiot(url, res);
    } catch (e) { res.status(400).json({ error: "Invalid Region" }); }
});

// 2. SUMMONER (wymaga Platform Routing np. euw1)
app.get('/api/summoner/:region/:puuid', (req, res) => {
    try {
        const { region, puuid } = req.params;
        const { platform } = getRegionConfig(region);
        
        const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        fetchRiot(url, res);
    } catch (e) { res.status(400).json({ error: "Invalid Region" }); }
});

// 3. RANKED (wymaga Platform Routing np. euw1)
app.get('/api/ranked/:region/:summonerId', (req, res) => {
    try {
        const { region, summonerId } = req.params;
        const { platform } = getRegionConfig(region);
        
        const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
        fetchRiot(url, res);
    } catch (e) { res.status(400).json({ error: "Invalid Region" }); }
});

// 4. MATCH HISTORY (wymaga Regional Routing np. europe)
app.get('/api/matches/ids/:region/:puuid', (req, res) => {
    try {
        const { region, puuid } = req.params;
        const { region: regionalRoute } = getRegionConfig(region);
        
        const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`;
        fetchRiot(url, res);
    } catch (e) { res.status(400).json({ error: "Invalid Region" }); }
});

// 5. MATCH DETAILS (wymaga Regional Routing np. europe)
app.get('/api/matches/details/:region/:matchId', (req, res) => {
    try {
        const { region, matchId } = req.params;
        const { region: regionalRoute } = getRegionConfig(region);
        
        const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        fetchRiot(url, res);
    } catch (e) { res.status(400).json({ error: "Invalid Region" }); }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});