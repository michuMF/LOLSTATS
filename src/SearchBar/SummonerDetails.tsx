export const SummonerDetails = ({
  summonerData,
}: {
  summonerData: {
    gameName: string;
    tagLine: string;
    puuid: string;
    summonerLevel?: number;
    profileIconId?: number;
  };
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <div className="flex flex-col items-center space-y-6">
        {/* Dane przywoływacza na górze */}
        <p className="text-2xl font-bold text-gray-800">
          {summonerData.gameName}#{summonerData.tagLine}
        </p>

        {/* Ikona profilu */}
        {summonerData.profileIconId && (
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/${summonerData.profileIconId}.png`}
            alt="Profile Icon"
            className="w-24 h-24 rounded-full border-4 border-gray-800"
          />
        )}

        {/* Poziom przywoływacza */}
        {summonerData.summonerLevel && (
          <p className="text-lg text-gray-800">
            <strong>Summoner Level:</strong> {summonerData.summonerLevel}
          </p>
        )}
      </div>
    </div>
  );
};