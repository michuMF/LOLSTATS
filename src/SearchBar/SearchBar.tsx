import { useState } from "react";
import { FaSearch, FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { REGIONS } from "../utils/constants";



export const SearchBar = () => {
  const [input, setInput] = useState("");
  const [region, setRegion] = useState("EUNE"); // Domyślny region
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!input.includes("#")) {
      alert("Format: Nick#TAG");
      return;
    }
    const [gameName, tagLine] = input.split("#");
    // Przekieruj do URL z regionem
    navigate(`/profile/${region}/${gameName}/${tagLine}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xl">
      <div className="flex items-center bg-white rounded-lg border border-slate-300 overflow-hidden shadow-sm w-full transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        
        {/* SELECT REGIONU */}
        <div className="relative border-r border-slate-200 bg-slate-50">
           <select 
             value={region}
             onChange={(e) => setRegion(e.target.value)}
             className="appearance-none bg-transparent py-3 pl-8 pr-8 text-slate-700 font-bold text-sm outline-none cursor-pointer hover:bg-slate-100 transition"
           >
             {REGIONS.map(r => (
               <option key={r.value} value={r.value}>{r.label}</option>
             ))}
           </select>
           <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        </div>

        <span className="pl-3 text-slate-400 font-bold text-xs uppercase hidden sm:inline">Search:</span>
        <input
          type="text"
          placeholder="Nick#TAG (np. Faker#KR1)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-grow p-3 outline-none text-slate-800 placeholder-slate-400 font-medium"
        />
        <button 
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition cursor-pointer font-bold flex items-center gap-2"
        >
          <FaSearch /> <span className="hidden sm:inline">GG</span>
        </button>
      </div>
    </div>
  );
};