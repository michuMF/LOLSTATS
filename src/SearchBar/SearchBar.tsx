import { useState } from "react";
import { FaSearch } from "react-icons/fa";
const API_KEY = import.meta.env.VITE_REACT_APP_RIOT_API_KEY;








export const SearchBar = ({ onFetchSuccess }: { onFetchSuccess: (data: { puuid: string; gameName: string; tagLine: string }) => void }) => {
  const [summonerName, setSummonerName] = useState("");

  
  const fetchSummonerProfile = async () => {
   

    try {
      const response = await fetch(
          `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/MID?api_key=${API_KEY}`,
          {
          headers: {
            "X-Riot-Token": API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch summoner profile");
      }

      const data = await response.json();
      
      onFetchSuccess(data); // Przekazanie danych do komponentu nadrzędnego
     
    } catch (error) {
      console.error("Error fetching summoner profile:", error);
    }
  };

  return (
    <div>
      <label htmlFor="search-input" className="mr-2">Search:</label>
      <input
        id="search-input"
        type="text"
        placeholder="Enter name..."
        value={summonerName}
        onChange={(e) => setSummonerName(e.target.value)}
        className="p-1 mr-2 border border-gray-300 rounded"
      />
      <button className="cursor-pointer" onClick={fetchSummonerProfile}>
        <FaSearch />
      </button>
    </div>
  );
};