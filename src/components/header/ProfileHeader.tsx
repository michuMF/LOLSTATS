import { Link } from "react-router-dom";
import { FaGamepad } from "react-icons/fa";
import { SearchBar } from "../../SearchBar/SearchBar";

interface ProfileHeaderProps {
  region: string;
  gameName: string;
  tagLine: string;
}

export const ProfileHeader = ({ region, gameName, tagLine }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-slate-200 pb-6">
      <Link to="/" className="text-3xl font-black text-slate-800 hover:text-blue-600 transition">
        LOL<span className="text-blue-600">STATS</span>
      </Link>

      <div className="w-full md:w-auto">
        <SearchBar />
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          to={`/live/${region}/${gameName}/${tagLine}`}
          className="
            group relative inline-flex items-center gap-3 px-8 py-3 
            bg-gradient-to-r from-blue-600 to-blue-500 
            hover:from-blue-500 hover:to-blue-400 
            text-white font-bold text-lg rounded-full 
            shadow-[0_0_15px_rgba(37,99,235,0.5)] 
            hover:shadow-[0_0_25px_rgba(37,99,235,0.8)] 
            transform transition-all duration-300 hover:-translate-y-1 hover:scale-105
          "
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
          </span>
          <span>Live Game</span>
          <FaGamepad className="text-xl opacity-80 group-hover:rotate-12 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
