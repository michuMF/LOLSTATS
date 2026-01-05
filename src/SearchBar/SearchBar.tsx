import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Importujemy hook nawigacji

export const SearchBar = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!input.includes("#")) {
      alert("Format: Nick#TAG");
      return;
    }
    const [gameName, tagLine] = input.split("#");
    // Przekieruj do URL profilu
    navigate(`/profile/${gameName}/${tagLine}`);
  };

  return (
    <div className="flex items-center bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm w-full max-w-md">
      <span className="pl-3 text-gray-500 font-bold">Search:</span>
      <input
        type="text"
        placeholder="Nick#TAG (np. Faker#KR1)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="flex-grow p-2 outline-none text-gray-700"
      />
      <button 
        onClick={handleSearch}
        className="bg-blue-600 text-white p-3 hover:bg-blue-700 transition cursor-pointer"
      >
        <FaSearch />
      </button>
    </div>
  );
};