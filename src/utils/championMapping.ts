// src/utils/championMapping.ts

export const normalizeChampionName = (name: string): string => {
  if (!name) return "";

  // 1. Usuń spacje i znaki specjalne (proste czyszczenie)
  // Np. "Dr. Mundo" -> "DrMundo", "Kog'Maw" -> "KogMaw"
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "");

  // 2. Mapa wyjątków (Kluczowe dla DDragon!)
  const exceptions: Record<string, string> = {
    wukong: "MonkeyKing",
    monkeyking: "MonkeyKing",
    renataglasc: "Renata",
    renata: "Renata",
    belveth: "Belveth", // Czasami wymagane
    nunu: "Nunu", // Nunu & Willump
    nunuwillump: "Nunu",
  };

  const lowerName = cleanName.toLowerCase();

  if (exceptions[lowerName]) {
    return exceptions[lowerName];
  }

  // 3. Domyślnie: Pierwsza litera duża, reszta mała (np. aatrox -> Aatrox)
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
};
