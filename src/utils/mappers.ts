export const getQueueName = (queueId: number) => {
  switch (queueId) {
    case 420: return "Ranked Solo";
    case 440: return "Ranked Flex";
    case 400: return "Draft Pick";
    case 430: return "Blind Pick";
    case 450: return "ARAM";
    case 1700: return "Arena"; // Warto dodać
    case 1870: return "Operation: Swarm"; // Tryb PvE (Anima Squad)
    case 900: return "ARAM: Chaos"; // <--- Nowy tryb Chaos (Mayhem)
    default: return `Normal (${queueId})`; // Dobra praktyka: pokazuj ID nieznanych kolejek
  }
};