import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageLoadingFallback } from "./components/ui/PageLoadingFallback";

// Lazy load all page components for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilPage"));
const LiveGamePage = lazy(() => import("./pages/LiveGamePage"));
const MetaAnalysisPage = lazy(() => import("./pages/MetaAnalysisPage"));

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile/:region/:gameName/:tagLine" element={<ProfilePage />} />

            <Route path="/champions" element={<MetaAnalysisPage />} />
            <Route path="/live/:region/:gameName/:tagLine" element={<LiveGamePage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
