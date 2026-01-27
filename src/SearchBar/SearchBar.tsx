import { useState, useEffect } from "react";
import { FaSearch, FaGlobe, FaHistory } from "react-icons/fa"; // Dodałem ikonę historii opcjonalnie
import { useNavigate } from "react-router-dom";
import { REGIONS } from "../utils/constants";

// Definiujemy, co przechowujemy w historii
interface HistoryItem {
  name: string; // np. "Faker#KR1"
  region: string; // np. "KR"
}

export const SearchBar = () => {
  const [input, setInput] = useState("");
  const [region, setRegion] = useState("EUNE"); // Domyślny region
  const [recent, setRecent] = useState<HistoryItem[]>([]); // Stan na historię obiektów
  const navigate = useNavigate();

  // 1. Ładowanie historii przy starcie
  useEffect(() => {
    const saved = localStorage.getItem("lolstats_recent_v2"); // Zmieniam klucz na v2, bo zmieniła się struktura danych
    if (saved) {
      try {
        setRecent(JSON.parse(saved));
      } catch (e) {
        console.error("Błąd odczytu historii", e);
      }
    }
  }, []);

  // Funkcja wykonująca wyszukiwanie
  // Przyjmuje argumenty, zamiast polegać tylko na stanie, co naprawia problem asynchroniczności
  const performSearch = (searchName: string, searchRegion: string) => {
    if (!searchName.includes("#")) {
      alert("Format: Nick#TAG (np. Faker#KR1)");
      return;
    }

    // A. Aktualizujemy UI (żeby inputy pasowały do tego co szukamy)
    setInput(searchName);
    setRegion(searchRegion);

    // B. Logika zapisu do historii
    const newItem: HistoryItem = { name: searchName, region: searchRegion };

    // Filtrujemy, aby usunąć duplikaty (ten sam nick I ten sam region)
    const filteredHistory = recent.filter(
      (item) => !(item.name === searchName && item.region === searchRegion)
    );

    // Dodajemy nowy na początek i ucinamy do 5 elementów
    const newHistory = [newItem, ...filteredHistory].slice(0, 5);

    setRecent(newHistory);
    localStorage.setItem("lolstats_recent_v2", JSON.stringify(newHistory));

    // C. Przekierowanie
    const [gameName, tagLine] = searchName.split("#");
    navigate(`/profile/${searchRegion}/${gameName}/${tagLine}`);
  };

  return (
    <div className="flex flex-col w-full max-w-xl gap-3">
      {/* GLÓWNY PASEK WYSZUKIWANIA */}
      <div className="flex items-center bg-white rounded-lg border border-slate-300 overflow-hidden shadow-sm w-full transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* SELECT REGIONU */}
        <div className="relative border-r border-slate-200 bg-slate-50">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)} // Tutaj jest Twój setRegion, którego brakowało w logice historii
            className="appearance-none bg-transparent py-3 pl-8 pr-8 text-slate-700 font-bold text-sm outline-none cursor-pointer hover:bg-slate-100 transition"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        </div>

        <span className="pl-3 text-slate-400 font-bold text-xs uppercase hidden sm:inline">
          Search:
        </span>
        <input
          type="text"
          placeholder="Nick#TAG"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && performSearch(input, region)}
          className="flex-grow p-3 outline-none text-slate-800 placeholder-slate-400 font-medium"
        />
        <button
          onClick={() => performSearch(input, region)}
          className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition cursor-pointer font-bold flex items-center gap-2"
        >
          <FaSearch /> <span className="hidden sm:inline">GG</span>
        </button>
      </div>

      {/* HISTORIA WYSZUKIWANIA */}
      {recent.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs animate-fadeIn">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
            <FaHistory /> Recent:
          </span>
          {recent.map((item, index) => (
            <button
              key={index}
              // KLUCZOWE: Przekazujemy region z historii do funkcji wyszukującej!
              onClick={() => performSearch(item.name, item.region)}
              className="bg-slate-200 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded text-slate-600 font-medium transition flex items-center gap-1 border border-slate-300"
            >
              <span>{item.name}</span>
              <span className="bg-white px-1 rounded text-[9px] text-slate-400 border border-slate-200">
                {item.region}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
