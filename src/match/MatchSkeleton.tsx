import { Skeleton } from "../components/ui/Skeleton";

export const MatchSkeleton = () => {
  return (
    <div className="bg-white rounded-r-xl rounded-l-md shadow-sm border border-slate-200 border-l-[6px] border-l-slate-300 overflow-hidden p-4 sm:px-6 flex flex-col sm:flex-row items-center gap-4">
      {/* INFO */}
      <div className="w-full sm:w-32 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-start gap-2">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20 bg-slate-200" />
          <Skeleton className="h-3 w-16 bg-slate-200" />
        </div>
        <div className="flex flex-col items-end sm:items-start gap-1">
          <Skeleton className="h-5 w-12 rounded bg-slate-200" />
          <Skeleton className="h-3 w-10 bg-slate-200" />
        </div>
      </div>

      {/* POSTAĆ I STATYSTYKI */}
      <div className="flex items-center gap-4 flex-grow justify-center sm:justify-start w-full sm:w-auto">
        <Skeleton className="w-14 h-14 rounded-lg bg-slate-300" />

        <div className="flex flex-col gap-1">
          <Skeleton className="w-6 h-6 rounded bg-slate-300" />
          <Skeleton className="w-6 h-6 rounded bg-slate-300" />
        </div>

        <div className="ml-2 sm:ml-6 flex flex-col items-center sm:items-start gap-1">
          <Skeleton className="h-6 w-24 bg-slate-200" />
          <Skeleton className="h-3 w-16 bg-slate-200" />
          <Skeleton className="h-4 w-20 rounded bg-slate-100" />
        </div>
      </div>

      {/* ITEMY */}
      <div className="hidden sm:flex flex-wrap items-center gap-1 pl-4 border-l border-slate-100">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded bg-slate-200" />
        ))}
        <div className="ml-2">
          <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
};
