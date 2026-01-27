// src/components/champion/ChampionHeader.tsx
import type { ChampionDetailDTO } from "../../types/champion";

interface ChampionHeaderProps {
  champion: ChampionDetailDTO;
}

export const ChampionHeader = ({ champion }: ChampionHeaderProps) => {
  const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl mb-8 group">
      {/* Tło */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${splashUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

      {/* Treść */}
      <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3">
        <h2 className="text-yellow-400 font-bold uppercase tracking-widest text-sm mb-2">
          {champion.title}
        </h2>
        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">{champion.name}</h1>
        <div className="flex gap-2 mb-4">
          {champion.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-800/80 text-blue-300 rounded text-xs font-bold border border-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 md:line-clamp-none">
          {champion.lore}
        </p>
      </div>
    </div>
  );
};
