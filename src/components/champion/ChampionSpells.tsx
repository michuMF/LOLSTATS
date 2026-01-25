// src/components/champion/ChampionSpells.tsx
import type { ChampionDetailDTO } from "../../types/champion";

interface ChampionSpellsProps {
  champion: ChampionDetailDTO;
}

export const ChampionSpells = ({ champion }: ChampionSpellsProps) => {
  const version = "14.1.1"; // Warto pobrać z contextu/propsów

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Umiejętności</h3>
      
      <div className="space-y-6">
        {/* Pasywka */}
        <div className="flex gap-4 items-start group">
          <img 
            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${champion.passive.image.full}`}
            alt={champion.passive.name}
            className="w-16 h-16 rounded border-2 border-slate-300 group-hover:border-yellow-500 transition"
          />
          <div>
            <h4 className="font-bold text-slate-700">Pasywna: {champion.passive.name}</h4>
            <div 
                className="text-sm text-slate-500 mt-1"
                dangerouslySetInnerHTML={{ __html: champion.passive.description }} 
            />
          </div>
        </div>

        {/* Spells Q-R */}
        {champion.spells.map((spell, index) => {
          const hotkey = ["Q", "W", "E", "R"][index];
          return (
            <div key={spell.id} className="flex gap-4 items-start group">
              <div className="relative">
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`}
                  alt={spell.name}
                  className="w-16 h-16 rounded border-2 border-slate-300 group-hover:border-blue-500 transition"
                />
                <span className="absolute -bottom-2 -right-2 w-6 h-6 bg-slate-800 text-white flex items-center justify-center text-xs font-bold rounded shadow">
                  {hotkey}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-700">{spell.name}</h4>
                <p className="text-xs text-slate-400 mb-1">
                    Cooldown: {spell.cooldown.join(" / ")}s
                </p>
                <div 
                    className="text-sm text-slate-500"
                    dangerouslySetInnerHTML={{ __html: spell.description }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};