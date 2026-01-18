// src/components/player-summary/QueueTabs.tsx

export const QUEUE_FILTERS: Record<string, { id: number | null; label: string }> = {
  ALL: { id: null, label: "Wszystkie" },
  SOLO: { id: 420, label: "Ranked Solo" },
  FLEX: { id: 440, label: "Ranked Flex" },
  ARAM: { id: 450, label: "ARAM" },
  CHAOS: { id: 900, label: "ARAM: Chaos" }, 
  ARENA: { id: 1700, label: "Arena" },
};

export type QueueKey = keyof typeof QUEUE_FILTERS;

interface QueueTabsProps {
  activeFilter: QueueKey;
  onFilterChange: (filter: QueueKey) => void;
}

export const QueueTabs = ({ activeFilter, onFilterChange }: QueueTabsProps) => {

  
  
  return (
    <div className="bg-slate-50 border-b border-slate-200 flex flex-wrap">
      {Object.entries(QUEUE_FILTERS).map(([key, config]) => (
        <button
          key={key}
          onClick={() => onFilterChange(key as QueueKey)}
          className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 outline-none ${
            activeFilter === key
              ? "border-blue-500 text-blue-600 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          {config.label}
        </button>
      ))}
    </div>
  );
};