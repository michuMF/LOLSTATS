// src/components/player-summary/WinRateChart.tsx
interface WinRateChartProps {
  wins: number;
  losses: number;
  games: number;
  winrate: number;
}

export const WinRateChart = ({ wins, losses, games, winrate }: WinRateChartProps) => {
  // Obliczenia do SVG
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ok. 251.2
  const offset = circumference - (winrate / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center border-r-0 md:border-r border-slate-100 pr-0 md:pr-6">
      <div className="relative w-24 h-24 mb-2">
        <svg className="w-full h-full transform -rotate-90">
          {/* Tło koła */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          {/* Pasek postępu */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${
              winrate >= 50 ? "text-blue-500" : "text-red-500"
            } transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-black text-slate-800">{winrate}%</span>
          <span className="text-[10px] uppercase text-slate-400 font-bold">
            Winrate
          </span>
        </div>
      </div>
      <div className="text-xs text-slate-500 font-medium">
        <span className="text-blue-600 font-bold">{wins}W</span> -{" "}
        <span className="text-red-500 font-bold">{losses}L</span>
        <span className="mx-1 text-slate-300">|</span>
        {games} Games
      </div>
    </div>
  );
};