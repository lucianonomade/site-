
import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import VideoSection from './components/VideoSection';
import Footer from './components/Footer';
import GeminiAssistant from './components/GeminiAssistant';

const App: React.FC = () => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeroSection />
      <VideoSection />
      <Footer />
      
      {/* Floating Action Button for AI Assistant */}
      <div className="fixed bottom-10 left-8 z-50">
        <button 
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`relative group w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/30 ${isAiOpen ? 'bg-secondary text-white' : 'bg-primary text-white'}`}
        >
          {!isAiOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
          )}
          {isAiOpen ? (
            <i className="fas fa-times text-xl"></i>
          ) : (
            <i className="fas fa-robot text-xl"></i>
          )}
          <span className="absolute left-16 bg-white text-gray-800 text-xs font-bold py-2 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-100">
            Falar com AgroAssist
          </span>
        </button>
      </div>

      {isAiOpen && (
        <div className="fixed bottom-28 left-8 z-50 w-[90vw] sm:w-96 h-[550px] shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
          <GeminiAssistant onClose={() => setIsAiOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default App;
