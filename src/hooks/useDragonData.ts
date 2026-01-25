import { useState, useEffect } from "react";

type IdMap = Record<number, string>; // ID -> Nazwa
type RuneMap = Record<number, string>; // ID -> Ścieżka icon

export const useDragonData = () => {
  const [championMap, setChampionMap] = useState<IdMap>({});
  const [spellMap, setSpellMap] = useState<IdMap>({});
  const [runeMap, setRuneMap] = useState<RuneMap>({});
  
  // Domyślnie jakaś nowsza wersja, ale zaraz ją nadpiszemy z API
  const [version, setVersion] = useState<string>("15.1.1"); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaticData = async () => {
      setLoading(true);
      try {
        // KROK 1: Pobierz najnowszą wersję gry z API Riotu
        const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const versions = await versionRes.json();
        const latestVersion = versions[0]; // Pierwsza na liście to najnowsza (np. "15.1.1")
        
        setVersion(latestVersion);

        // KROK 2: Sprawdź Cache dla tej konkretnej wersji
        const cacheKey = `ddragon_cache_${latestVersion}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            const parsed = JSON.parse(cached);
            setChampionMap(parsed.champions);
            setSpellMap(parsed.spells);
            setRuneMap(parsed.runes);
            setLoading(false);
            return;
        }

        // KROK 3: Pobierz dane dla NAJNOWSZEJ wersji
        const lang = "pl_PL"; // lub en_US
        const [resChamps, resSpells, resRunes] = await Promise.all([
            fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/${lang}/champion.json`),
            fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/${lang}/summoner.json`),
            fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/${lang}/runesReforged.json`)
        ]);

        if (!resChamps.ok || !resSpells.ok || !resRunes.ok) {
            throw new Error("Failed to fetch DDragon data");
        }

        const jsonChamps = await resChamps.json();
        const jsonSpells = await resSpells.json();
        const jsonRunes = await resRunes.json();

        // Mapowanie Championów
        const cMap: IdMap = {};
        Object.values(jsonChamps.data).forEach((c: any) => {
            cMap[Number(c.key)] = c.id;
        });

        // Mapowanie Spelli
        const sMap: IdMap = {};
        Object.values(jsonSpells.data).forEach((s: any) => {
             sMap[Number(s.key)] = s.id; 
        });

        // Mapowanie Run
        const rMap: RuneMap = {};
        jsonRunes.forEach((tree: any) => {
            rMap[tree.id] = tree.icon; // Główne ścieżki
            tree.slots.forEach((slot: any) => {
                slot.runes.forEach((rune: any) => {
                    rMap[rune.id] = rune.icon;
                });
            });
        });

        setChampionMap(cMap);
        setSpellMap(sMap);
        setRuneMap(rMap);
        
        // Zapisz do cache
        localStorage.setItem(cacheKey, JSON.stringify({ champions: cMap, spells: sMap, runes: rMap }));

      } catch (err) {
        console.error("Błąd pobierania DragonData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaticData();
  }, []);

  const getChampionName = (id: number) => championMap[id] || "Unknown";
  const getSpellId = (id: number) => spellMap[id] || null; 
  const getRuneIcon = (id: number) => runeMap[id] || null; 

  return { getChampionName, getSpellId, getRuneIcon, loading, version };
};