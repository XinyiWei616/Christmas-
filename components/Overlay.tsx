import React from 'react';
import { AppState } from '../types';
import { COLORS } from '../constants';

interface OverlayProps {
  appState: AppState;
  setAppState: (s: AppState) => void;
}

const Overlay: React.FC<OverlayProps> = ({ appState, setAppState }) => {
  const isTree = appState === AppState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between items-center p-8 z-10">
      
      {/* Header */}
      <div className="text-center space-y-2 mt-4 opacity-90">
        <h1 
          className="text-4xl md:text-6xl text-transparent bg-clip-text font-serif tracking-widest drop-shadow-lg"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, ${COLORS.goldLight}, ${COLORS.gold})`,
            fontFamily: '"Cinzel", serif'
          }}
        >
          ARIX
        </h1>
        <p className="text-emerald-300 font-light tracking-[0.3em] text-xs md:text-sm uppercase">
          Signature Collection
        </p>
      </div>

      {/* Controls */}
      <div className="mb-12 pointer-events-auto">
        <button
          onClick={() => setAppState(isTree ? AppState.SCATTERED : AppState.TREE_SHAPE)}
          className="group relative px-8 py-4 bg-black/40 backdrop-blur-md border border-yellow-600/30 rounded-full overflow-hidden transition-all duration-500 hover:border-yellow-400/80 hover:bg-black/60"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          <span 
            className="relative text-yellow-100 font-serif text-lg tracking-widest transition-colors group-hover:text-white"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {isTree ? "RELEASE FORM" : "ASSEMBLE TREE"}
          </span>
        </button>
      </div>

      {/* Corner Deco */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-yellow-900/30 m-6" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-yellow-900/30 m-6" />
      
    </div>
  );
};

export default Overlay;
