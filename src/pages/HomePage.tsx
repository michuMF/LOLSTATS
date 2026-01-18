// src/pages/HomePage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaTrophy, FaArrowRight } from "react-icons/fa";
import { SearchBar } from "../SearchBar/SearchBar";


export const HomePage = () => {
  // Opcjonalnie: Stan do prostych animacji lub przełączania widoku (jeśli chciałbyś chować searchbar)
  // W tym przypadku stawiamy na widoczność obu opcji od razu.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Tło / Background Effects (możesz dostosować do swojego CSS) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl -z-10" />

      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4 tracking-tight">
          LOL STATS
        </h1>
        <p className="text-gray-400 text-lg">
          Twoje centrum dowodzenia. Sprawdź statystyki graczy lub odkryj buildy najlepszych OTP.
        </p>
      </div>

      {/* --- GRID DWÓCH GŁÓWNYCH OPCJI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        
        {/* OPCJA 1: Szukanie Gracza */}
        <div className="group relative bg-gray-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 flex flex-col items-center">
          <div className="absolute -top-6 bg-gray-900 p-4 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-300">
            <FaSearch className="text-3xl text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mt-6 mb-2">Znajdź Gracza</h2>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Sprawdź historię gier, rangi i statystyki dowolnego przywoływacza.
          </p>
          
          <div className="w-full">
            <SearchBar />
          </div>
        </div>

        {/* OPCJA 2: Baza Buildów OTP */}
        <Link 
          to="/champions"
          className="group relative bg-gray-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-300 shadow-lg hover:shadow-yellow-500/10 flex flex-col items-center cursor-pointer"
        >
          <div className="absolute -top-6 bg-gray-900 p-4 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-300">
            <FaTrophy className="text-3xl text-yellow-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mt-6 mb-2">Buildy OTP</h2>
          <p className="text-gray-400 text-sm mb-8 text-center">
            Zobacz, co budują najlepsi gracze (One Trick Pony) na świecie w obecnym patchu.
          </p>

          <div className="mt-auto flex items-center gap-2 text-yellow-400 font-semibold group-hover:gap-4 transition-all">
            Przejdź do bazy wiedzy <FaArrowRight />
          </div>
        </Link>

      </div>

      {/* Footer / Info */}
      <div className="mt-16 text-white/20 text-sm">
        &copy; {new Date().getFullYear()} LolStats. Dane dostarczane przez Riot API & Community Dragon.
      </div>
    </div>
  );
};

export default HomePage;