import React from 'react';
import { JOINT_PRESETS, JointPreset } from '../constants';

interface GalleryProps {
  onSelect: (preset: JointPreset) => void;
}

const Gallery: React.FC<GalleryProps> = ({ onSelect }) => {
  return (
    <section className="mt-20 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 shadow-inner">
                <i className="fa-solid fa-compass-drafting text-amber-500 text-2xl"></i>
             </div>
             <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-100">
                  Masterpiece Gallery
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-px w-8 bg-amber-500/50"></span>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Standardized Schematics</p>
                </div>
             </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-6 bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></span>
              <span>Novice</span>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse"></span>
              <span>Artisan</span>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse"></span>
              <span>Master</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        {JOINT_PRESETS.map((preset) => {
          return (
            <div 
              key={preset.id}
              className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-amber-500/50 transition-all duration-700 shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-2"
            >
              {/* Visual Header */}
              <div className="relative h-64 w-full overflow-hidden bg-slate-950">
                <img 
                  src={preset.imageUrl} 
                  alt={preset.name}
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-110 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-90 pointer-events-none"></div>
                
                {/* Overlay Text */}
                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-xl border border-white/10 shadow-2xl transition-all group-hover:px-6 ${
                    preset.difficulty === 'Master' ? 'bg-red-500/90 text-white' : 
                    preset.difficulty === 'Intermediate' ? 'bg-blue-500/90 text-white' : 'bg-green-500/90 text-white'
                  }`}>
                    <i className={`fa-solid ${
                      preset.difficulty === 'Master' ? 'fa-crown' : 
                      preset.difficulty === 'Intermediate' ? 'fa-medal' : 'fa-hammer'
                    } text-[10px]`}></i>
                    {preset.difficulty}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none text-shadow">
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1.5 drop-shadow-lg">
                      Typical Application
                  </p>
                  <h4 className="text-white text-lg font-bold tracking-tight drop-shadow-lg">
                    {preset.context}
                  </h4>
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-100 group-hover:text-amber-500 transition-colors leading-none mb-3">
                      {preset.name}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-light italic opacity-80">
                      {preset.description}
                    </p>
                  </div>

                  {preset.technicalDetails && (
                    <div className="space-y-2 pt-4 border-t border-slate-800">
                      <p className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest">Technical Specifications</p>
                      <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {preset.technicalDetails.map((detail, i) => (
                          <li key={i} className="flex gap-2 items-start group/detail">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/30 group-hover/detail:bg-amber-500 mt-1 shrink-0 transition-colors"></span>
                            <span className="text-[11px] text-slate-400 leading-tight font-medium">
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3 pt-6 border-t border-slate-800">
                    <div className="flex justify-between items-center group/item">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">Historical Stock</span>
                      <span className="text-xs font-bold text-slate-200">{preset.recommendedWood}</span>
                    </div>
                    <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 group-hover:border-slate-700 transition-colors">
                      <p className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Heritage Note</p>
                      <p className="text-[11px] text-slate-400 leading-tight font-medium">
                        {preset.history}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Stock Width</span>
                      <span className="font-mono text-sm text-slate-300 font-bold">{preset.boardWidth.toFixed(2)}"</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-800 pl-4">
                      <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Depth</span>
                      <span className="font-mono text-sm text-slate-300 font-bold">{preset.boardThickness.toFixed(3)}"</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onSelect(preset)}
                  className="mt-8 w-full py-4 bg-slate-800/50 border border-slate-700 hover:border-amber-500 group-hover:bg-amber-600 text-slate-400 group-hover:text-white text-xs font-black rounded-[1.25rem] transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-[0.2em] active:scale-[0.98] shadow-lg"
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-[11px] animate-pulse"></i>
                  Apply Schematic
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center items-center gap-4 py-10 opacity-20 grayscale">
         <i className="fa-solid fa-tree text-2xl"></i>
         <div className="h-px w-24 bg-slate-500"></div>
         <span className="text-[10px] font-black uppercase tracking-[0.5em]">The Craftsman's Code</span>
         <div className="h-px w-24 bg-slate-500"></div>
         <i className="fa-solid fa-hammer text-2xl"></i>
      </div>
    </section>
  );
};

export default Gallery;