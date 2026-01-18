import { Routes, Route } from "react-router-dom";
import {HomePage} from "./pages/HomePage";


import { ProfilePage } from "./pages/ProfilPage";
import LiveGamePage from "./pages/LiveGamePage";
import ChampionsPage from "./pages/ChampionPage";


function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile/:region/:gameName/:tagLine" element={<ProfilePage />} />
        
        <Route path="/champions" element={<ChampionsPage />} />
        <Route path="/live/:region/:gameName/:tagLine" element={<LiveGamePage />} />
      </Routes>
    </div>
  );
}

export default App;