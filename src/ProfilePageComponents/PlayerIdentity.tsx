import type { SummonerProfileInfoType } from "../types";


export const PlayerIdentity = ({ summoner }: { summoner: SummonerProfileInfoType }) => {
  return (
    <div className="flex items-center gap-5 w-1/3">
      <div className="relative">
        <img
          src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summoner.profileIconId}.jpg`}
          alt="Icon"
          className="w-20 h-20 rounded-2xl border-2 border-slate-200 shadow-sm object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg";
          }}
        />
        <span className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white shadow-sm">
          {summoner.summonerLevel}
        </span>
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
          {summoner.gameName}
        </h1>
        <span className="text-sm font-semibold text-slate-400">
          #{summoner.tagLine}
        </span>
      </div>
    </div>
  );
};