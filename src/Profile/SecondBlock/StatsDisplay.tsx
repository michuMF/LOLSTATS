import { FaChartPie, FaCrosshairs, FaSkull } from "react-icons/fa";
import type { ReactNode } from "react";

interface StatsDisplayProps {
  kda: number | string;
  avgKills: string;
  avgDeaths: string;
  avgAssists: string;
  avgCs: string;
  csPerMin: string;
  avgDmg: string;
}

export const StatsDisplay = ({
  kda,
  avgKills,
  avgDeaths,
  avgAssists,
  avgCs,
  csPerMin,
  avgDmg,
}: StatsDisplayProps) => {
  return (
    <>
      {/* KOLUMNA 2: KDA */}
      <div className="flex flex-col items-center md:items-start justify-center gap-2 border-r-0 md:border-r border-slate-100 px-0 md:px-6">
        <div className="text-center md:text-left">
          <p className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
            <FaCrosshairs /> KDA Ratio
          </p>
          <p
            className={`text-3xl font-black ${Number(kda) >= 3 ? "text-blue-600" : "text-slate-700"
              }`}
          >
            {kda}
          </p>
        </div>
        <div className="text-sm text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
          <span className="font-bold">{avgKills}</span> /{" "}
          <span className="text-red-500 font-bold">{avgDeaths}</span> /{" "}
          <span className="font-bold">{avgAssists}</span>
        </div>
      </div>

      {/* KOLUMNA 3: CS i DMG */}
      <div className="space-y-3 px-0 md:px-6 border-r-0 md:border-r border-slate-100">
        <StatRow
          label="Avg. CS"
          value={`${avgCs} (${csPerMin}/min)`}
          icon={<FaChartPie />}
        />
        <StatRow label="Avg. Damage" value={avgDmg} icon={<FaSkull />} />
      </div>
    </>
  );
};

// Mały pomocniczy komponent (lokalny)
const StatRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) => (
  <div className="flex items-center justify-between w-full text-sm">
    <span className="text-slate-500 flex items-center gap-2">
      {icon} {label}
    </span>
    <span className="font-bold text-slate-800">{value}</span>
  </div>
);