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
  }[];
}) => {
  return (
    <div className="mt-4">
      {rankedData.map((ranked, index) => {
        // Sprawdź, czy którakolwiek z dodatkowych właściwości ma wartość "Yes"
        const hasAdditionalInfo =
          ranked.veteran || ranked.inactive || ranked.freshBlood || ranked.hotStreak;

        return (
          <div
            key={index}
            className="mt-4 p-4 border border-gray-300 rounded-lg bg-white shadow-md"
          >
            {/* Kolejka */}
            <p className="text-xl font-bold text-gray-800">
              {ranked.queueType === "RANKED_SOLO_5x5" ? "Ranked Solo" : ranked.queueType}
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
                {ranked.veteran && (
                  <p>
                    <strong>Veteran:</strong> Yes
                  </p>
                )}
                {ranked.inactive && (
                  <p>
                    <strong>Inactive:</strong> Yes
                  </p>
                )}
                {ranked.freshBlood && (
                  <p>
                    <strong>Fresh Blood:</strong> Yes
                  </p>
                )}
                {ranked.hotStreak && (
                  <p>
                    <strong>Hot Streak:</strong> Yes
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};