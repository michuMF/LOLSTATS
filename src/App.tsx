import { Routes, Route } from 'react-router-dom';

import './App.css';

import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilPage';



function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans text-slate-900">
       <Routes>
         <Route path="/" element={<HomePage />} />
         <Route path="/profile/:region/:gameName/:tagLine" element={<ProfilePage />} />
       </Routes>
    </div>
  );
}

export default App;