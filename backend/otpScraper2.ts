// // backend/otpAnalyzer.ts (lub sekcja w otpScraper.ts)

// const MATCH_HISTORY_COUNT = 10; // Ile meczy analizujemy wstecz

// // Helper do opóźnień (aby nie dostać bana od Riotu)
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// // 1. Pobierz historię gier konkretną postacią
// async function fetchPlayerHistory(puuid: string, championId: number) {
//   // Filtrujemy po championie i kolejce (420 = Ranked Solo/Duo)
//   const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&champion=${championId}&start=0&count=${MATCH_HISTORY_COUNT}`;
  
//   try {
//     const response = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
//     if (response.status === 429) {
//        console.warn("⚠️ Rate Limit! Czekam 10s...");
//        await delay(10000);
//        return []; // Lub ponów próbę
//     }
//     if (!response.ok) return [];
//     return await response.json() as string[];
//   } catch (e) {
//     console.error("Błąd fetchPlayerHistory", e);
//     return [];
//   }
// }

// // 2. Pobierz detale meczu (interesują nas tylko itemy i wygrana)
// async function fetchMatchBuild(matchId: string, puuid: string) {
//   const url = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`;
//   try {
//     const response = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
//     if (!response.ok) return null;
    
//     const data = await response.json();
//     const participant = data.info.participants.find((p: any) => p.puuid === puuid);
    
//     if (!participant) return null;

//     // Zwracamy tylko to co nas interesuje do analizy
//     return {
//       win: participant.win,
//       item0: participant.item0,
//       item1: participant.item1,
//       item2: participant.item2,
//       item3: participant.item3,
//       item4: participant.item4,
//       item5: participant.item5,
//       // item6 to trinket, zazwyczaj go pomijamy w core buildzie, ale można dodać
//     };
//   } catch (e) {
//     return null;
//   }
// }

// // 3. LOGIKA AGREGACJI: Wyłonienie najlepszego buildu
// function aggregateBuilds(matches: any[]) {
//   const itemCounts: Record<number, number> = {};
//   const bootsCounts: Record<number, number> = {};
//   let wins = 0;

//   // Lista ID butów (uproszczona)
//   const BOOTS_IDS = [1000, 3006, 3047, 3009, 3020, 3111, 3117, 3158]; 

//   matches.forEach(m => {
//     if (m.win) wins++;
//     const items = [m.item0, m.item1, m.item2, m.item3, m.item4, m.item5];
    
//     items.forEach(id => {
//       if (id === 0) return; // Pusty slot
      
//       if (BOOTS_IDS.includes(id)) {
//         bootsCounts[id] = (bootsCounts[id] || 0) + 1;
//       } else {
//         // Zliczamy zwykłe itemy. 
//         // UWAGA: Nie zliczamy składników (np. Long Sword), jeśli chcemy tylko pełne itemy.
//         // To wymagałoby listy "Legendary Items". Na razie liczymy wszystko.
//         itemCounts[id] = (itemCounts[id] || 0) + 1;
//       }
//     });
//   });

//   // Sortowanie itemów od najczęstszego
//   const sortedItems = Object.entries(itemCounts)
//     .sort(([, countA], [, countB]) => countB - countA)
//     .map(([id]) => parseInt(id));

//   // Znalezienie najczęstszych butów
//   const sortedBoots = Object.entries(bootsCounts)
//     .sort(([, countA], [, countB]) => countB - countA)
//     .map(([id]) => parseInt(id));
    
//   const bestBoots = sortedBoots.length > 0 ? sortedBoots[0] : null;
  
//   // Składamy build: Buty + 5 najczęstszych itemów (lub 6 jeśli brak butów)
//   const finalBuild = bestBoots 
//     ? [bestBoots, ...sortedItems.slice(0, 5)] 
//     : sortedItems.slice(0, 6);

//   return {
//     items: finalBuild,
//     winrate: (wins / matches.length) * 100,
//     gamesAnalyzed: matches.length
//   };
// }