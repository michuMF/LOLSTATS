import { SearchBar } from "../SearchBar/SearchBar";

export const HomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fadeIn">
    <div className="text-center space-y-2">
       <h1 className="text-6xl font-black text-slate-800 tracking-tight">
         LOL<span className="text-blue-600">STATS</span>
       </h1>
       <p className="text-slate-500 text-lg">Wyszukiwarka statystyk League of Legends z analizą AI</p>
    </div>
    <SearchBar />
  </div>
);