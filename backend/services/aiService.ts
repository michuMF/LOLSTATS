import { Ollama } from 'ollama';
import { z } from 'zod';
import { Match } from '../../src/types/match/Match';
import { ParticipantType } from '../../src/types/match/Participant';
import { ITEM_MAP, RUNE_MAP, CHAMPION_TAGS, IS_READY } from './dataDragon';

const ollama = new Ollama();

import { getExpertGuide, ExpertGuide } from './expertData';

// Schemat danych wyjściowych dla AI
export const AiMatchSummarySchema = z.object({
    result: z.string(),
    champion: z.string(),
    championId: z.number().optional(), // Needed for expert lookup
    tags: z.array(z.string()),
    role: z.string(),
    kda: z.string(),
    goldDiff: z.number(),
    csDiff: z.number(),
    damageShare: z.string(),
    visionScore: z.number(),
    items: z.array(z.string()),
    keystone: z.string(),
    secondaryTree: z.string(),
    summoners: z.array(z.string()),
    enemyLaner: z.object({
        champion: z.string(),
        championId: z.number().optional(),
        tags: z.array(z.string()),
        kda: z.string(),
        items: z.array(z.string()),
    }).nullable(),
    expertBenchmark: z.custom<ExpertGuide>().nullable().optional(),
});

export type AiMatchSummary = z.infer<typeof AiMatchSummarySchema>;

export const SUMMONER_SPELLS: Record<number, string> = {
    4: "Flash", 12: "Teleport", 14: "Ignite", 7: "Heal",
    6: "Ghost", 11: "Smite", 21: "Barrier", 3: "Exhaust", 1: "Cleanse", 32: "Snowball"
};

export function prepareMatchForLLM(match: Match, targetPuuid: string): AiMatchSummary {
    const participants = match.info.participants;
    const me = participants.find((p: ParticipantType) => p.puuid === targetPuuid);

    if (!me) throw new Error(`Nie znaleziono gracza o PUUID: ${targetPuuid}`);

    const enemy = participants.find(
        (p: ParticipantType) =>
            p.teamId !== me.teamId &&
            p.teamPosition === me.teamPosition &&
            p.teamPosition !== undefined && p.teamPosition !== ''
    );

    const stylePrimary = me.perks?.styles?.[0];
    const styleSub = me.perks?.styles?.[1];

    const perkId = stylePrimary?.selections?.[0]?.perk;
    const keystoneName = (perkId && RUNE_MAP[perkId]) ? RUNE_MAP[perkId] : `Rune-${perkId ?? 'Uk'}`;

    const subStyleId = styleSub?.style;
    const subTreeName = (subStyleId && RUNE_MAP[subStyleId]) ? RUNE_MAP[subStyleId] : "Unknown Tree";

    // --- PRO RAG LOOKUP ---
    const expertData = getExpertGuide(me.championId, enemy?.championId);

    const summary = {
        result: me.win ? 'ZWYCIĘSTWO' : 'PORAŻKA',
        champion: me.championName,
        championId: me.championId,
        tags: CHAMPION_TAGS[me.championName] || [],
        role: me.teamPosition || 'ARAM/OTHER',
        kda: `${me.kills}/${me.deaths}/${me.assists}`,
        goldDiff: enemy ? me.goldEarned - enemy.goldEarned : 0,
        csDiff: enemy ? (me.totalMinionsKilled + (me.neutralMinionsKilled || 0)) - (enemy.totalMinionsKilled + (enemy.neutralMinionsKilled || 0)) : 0,
        damageShare: ((me.totalDamageDealtToChampions / participants.filter(p => p.teamId === me.teamId).reduce((s, p) => s + p.totalDamageDealtToChampions, 0)) * 100).toFixed(1) + '%',
        visionScore: me.visionScore || 0,
        items: [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5].filter(id => id !== 0).map(id => ITEM_MAP[id] || `${id}`),
        keystone: keystoneName,
        secondaryTree: subTreeName,
        summoners: [
            SUMMONER_SPELLS[me.summoner1Id || 0] || `${me.summoner1Id}`,
            SUMMONER_SPELLS[me.summoner2Id || 0] || `${me.summoner2Id}`
        ],
        enemyLaner: enemy ? {
            champion: enemy.championName,
            championId: enemy.championId,
            tags: CHAMPION_TAGS[enemy.championName] || [],
            kda: `${enemy.kills}/${enemy.deaths}/${enemy.assists}`,
            items: [enemy.item0, enemy.item1, enemy.item2, enemy.item3, enemy.item4, enemy.item5].filter(id => id !== 0).map(id => ITEM_MAP[id] || `${id}`)
        } : null,
        expertBenchmark: expertData
    };

    return AiMatchSummarySchema.parse(summary);
}

export async function analyzeMatchWithAI(s: AiMatchSummary) {
    if (!IS_READY) {
        console.warn("⚠️ Baza danych wciąż się ładuje...");
    }

    console.log(`[AI] Analiza Zod: ${s.champion} vs ${s.enemyLaner?.champion || '?'}`);

    const prompt = `
    Jesteś Trenerem League of Legends (Challenger). 
    
    GRACZ:
    - Postać: ${s.champion} (Tagi: ${s.tags.join(', ')})
    - Wynik: ${s.result}
    - KDA: ${s.kda}
    - Gold Diff: ${s.goldDiff > 0 ? '+' : ''}${s.goldDiff} (vs oponent)
    - CS Diff: ${s.csDiff > 0 ? '+' : ''}${s.csDiff} (vs oponent)
    - Dmg%: ${s.damageShare}
    - Runy: ${s.keystone} + ${s.secondaryTree}
    - Build: ${s.items.join(', ')}

    RYWAL:
    ${s.enemyLaner ? `
    - Postać: ${s.enemyLaner.champion} (${s.enemyLaner.tags.join(', ')})
    - KDA: ${s.enemyLaner.kda}
    - Build: ${s.enemyLaner.items.join(', ')}
    ` : "Brak danych."}

    ${s.expertBenchmark ? `
    🧠 KONTEKST EKSPERCKI (CHALLENGER REPLAY):
    Porównaj gracza do Challengera (${s.expertBenchmark.player}, ${s.expertBenchmark.rank}):
    - Challenger w 14 minucie ma: ${s.expertBenchmark.earlyStats.cs} CS i ${s.expertBenchmark.earlyStats.gold} Golda.
    - Skill Order Challengera: ${s.expertBenchmark.skills.slice(0, 6).join(' -> ')}...
    - Zbudował przedmioty (ID): ${s.expertBenchmark.buildPath.map(b => b.itemId).slice(0, 3).join(', ')}.
    - KDA Challengera w podobnym meczu: ${s.expertBenchmark.kda}.
    ` : ""}

    ZADANIE:
    Oceń w punktach (Markdown, PL):
    1. Czy build pasuje na rywala? ${s.expertBenchmark ? "(Porównaj z Challengerem)" : ""}
    2. Kto wygrał linię?
    3. Jedna kluczowa rada, bazując na różnicach względem Challengera (np. CS, kolejność skilli).
  `;

    const response = await ollama.chat({
        model: 'llama3',
        messages: [{ role: 'user', content: prompt }],
        options: { temperature: 0.6 }
    });

    return response.message.content;
}
