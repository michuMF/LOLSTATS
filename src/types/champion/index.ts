import { z } from "zod";

// --- 1. Schematy DDragon (Static Data) ---

export const ChampionImageSchema = z.object({
  full: z.string(),
  sprite: z.string(),
  group: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

export const ChampionSpellSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tooltip: z.string(),
  image: ChampionImageSchema,
  cooldown: z.array(z.number()),
  cost: z.array(z.number()),
  range: z.array(z.number()),
});

export const ChampionPassiveSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: ChampionImageSchema,
});

export const ChampionSkinSchema = z.object({
  id: z.string(),
  num: z.number(),
  name: z.string(),
  chromas: z.boolean(),
});

export const ChampionStatsSchema = z.object({
  hp: z.number(),
  hpperlevel: z.number(),
  mp: z.number(),
  mpperlevel: z.number(),
  movespeed: z.number(),
  armor: z.number(),
  armorperlevel: z.number(),
  spellblock: z.number(),
  spellblockperlevel: z.number(),
  attackrange: z.number(),
  hpregen: z.number(),
  hpregenperlevel: z.number(),
  mpregen: z.number(),
  mpregenperlevel: z.number(),
  crit: z.number(),
  critperlevel: z.number(),
  attackdamage: z.number(),
  attackdamageperlevel: z.number(),
  attackspeedperlevel: z.number(),
  attackspeed: z.number(),
});

// Główny obiekt bohatera (z pliku individual champion json)
export const ChampionDetailSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  title: z.string(),
  image: ChampionImageSchema,
  skins: z.array(ChampionSkinSchema),
  lore: z.string(),
  blurb: z.string(),
  allytips: z.array(z.string()),
  enemytips: z.array(z.string()),
  tags: z.array(z.string()),
  partype: z.string(),
  info: z.object({
    attack: z.number(),
    defense: z.number(),
    magic: z.number(),
    difficulty: z.number(),
  }),
  stats: ChampionStatsSchema,
  spells: z.array(ChampionSpellSchema),
  passive: ChampionPassiveSchema,
});

// --- 2. Schematy Buildów/Recommended (Twoje API) ---

// Dostosuj to do faktycznej odpowiedzi z fetchChampionRecommended
export const RecommendedBuildSchema = z.object({
  lane: z.string(),
  winRate: z.number().optional(), // lub string, zależy od API
  pickRate: z.number().optional(),
  items: z.array(z.string()), // ID przedmiotów
  runes: z.object({
    primary: z.string(),
    sub: z.string(),
    perks: z.array(z.string()),
  }).optional(),
  skillOrder: z.array(z.string()).optional(), // np. ["Q", "E", "W", ...]
});

// --- 3. Inferencja Typów ---

export type ChampionDetailDTO = z.infer<typeof ChampionDetailSchema>;
export type RecommendedBuildDTO = z.infer<typeof RecommendedBuildSchema>;

export interface FullChampionData {
  details: ChampionDetailDTO;
  recommended: RecommendedBuildDTO[] | null;
}