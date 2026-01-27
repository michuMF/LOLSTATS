import { LoadingSpinner } from "./LoadingSpinner";

export const PageLoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-slate-400 text-sm">Loading page...</p>
      </div>
    </div>
  );
};
