

export const RankedData = ({
  rankedData,
}: {
  rankedData: {
    leagueId: string;
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    veteran: boolean;
    inactive: boolean;
    freshBlood: boolean;
    hotStreak: boolean;
  }[] | undefined; // Dodano undefined do typu, bo dane mogą się jeszcze ładować
}) => {
  // Zabezpieczenie: Jeśli dane są undefined (ładowanie) lub null, nie renderuj nic (lub renderuj loader)
  if (!rankedData) {
    return <div className="mt-4 text-gray-500">Loading ranked data...</div>;
  }

  // Zabezpieczenie: Jeśli tablica jest pusta (gracz Unranked)
  if (rankedData.length === 0) {
    return (
      <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-white shadow-md">
        <p className="text-xl font-bold text-gray-800">Unranked</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {rankedData.map((ranked, index) => {
        const hasAdditionalInfo =
          ranked.veteran || ranked.inactive || ranked.freshBlood || ranked.hotStreak;

        // Formatowanie nazwy kolejki
        const queueName = ranked.queueType === "RANKED_SOLO_5x5" 
          ? "Ranked Solo" 
          : ranked.queueType === "RANKED_FLEX_SR" 
            ? "Ranked Flex" 
            : ranked.queueType;

        return (
          <div
            key={index}
            className="mt-4 p-4 border border-gray-300 rounded-lg bg-white shadow-md"
          >
            {/* Kolejka */}
            <p className="text-xl font-bold text-gray-800">
              {queueName}
            </p>

            {/* Ranga i punkty ligowe */}
            <p className="text-lg text-gray-700">
              {ranked.tier} {ranked.rank} - {ranked.leaguePoints} LP
            </p>

            {/* Wygrane i przegrane */}
            <p className="text-lg">
              <span className="text-green-600 font-bold">{ranked.wins} Wins</span>{" "}
              |{" "}
              <span className="text-red-600 font-bold">{ranked.losses} Losses</span>
            </p>

            {/* Opcjonalne dodatkowe informacje */}
            {hasAdditionalInfo && (
              <div className="mt-2 text-sm text-gray-600">
                {ranked.veteran && <p><strong>Veteran</strong></p>}
                {ranked.inactive && <p><strong>Inactive</strong></p>}
                {ranked.freshBlood && <p><strong>Fresh Blood</strong></p>}
                {ranked.hotStreak && <p><strong>Hot Streak</strong></p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};