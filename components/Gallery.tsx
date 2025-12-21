
import React from 'react';
import { JOINT_PRESETS } from '../constants.ts';
import { JointPreset } from '../types.ts';

interface GalleryProps {
  onSelect: (preset: JointPreset) => void;
}

const Gallery: React.FC<GalleryProps> = ({ onSelect }) => {
  return (
    <section className="mt-20 mb-20 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="bg-slate-100 p-3 rounded-2xl border-2 border-slate-900">
                <i className="fa-solid fa-compass-drafting text-slate-900 text-2xl"></i>
             </div>
             <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                  Canon Archives
                </h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Verified Architectural Standards</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a]">
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500 border border-black"></span>
              <span className="text-slate-900">Novice</span>
            </div>
            <div className="flex items-center gap-3 border-l-2 border-slate-200 pl-6">
              <span className="w-3 h-3 rounded-full bg-blue-500 border border-black"></span>
              <span className="text-slate-900">Artisan</span>
            </div>
            <div className="flex items-center gap-3 border-l-2 border-slate-200 pl-6">
              <span className="w-3 h-3 rounded-full bg-red-600 border border-black"></span>
              <span className="text-slate-900">Master</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        {JOINT_PRESETS.map((preset) => (
          <div 
            key={preset.id}
            className="group relative flex flex-col bg-white border-2 border-slate-900 rounded-[2.5rem] overflow-hidden hover:shadow-[12px_12px_0_0_#0f172a] transition-all duration-300"
          >
            <div className="relative h-64 w-full overflow-hidden bg-slate-100 border-b-2 border-slate-900">
              <img 
                src={preset.imageUrl} 
                alt={preset.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
              
              <div className="absolute top-6 left-6 z-10">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-2 border-slate-900 shadow-[2px_2px_0_0_#000] ${
                  preset.difficulty === 'Master' ? 'bg-red-600 text-white' : 
                  preset.difficulty === 'Intermediate' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {preset.difficulty}
                </span>
              </div>
            </div>

            <div className="p-8 flex-grow flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase leading-none mb-3">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                    {preset.context} — {preset.recommendedWood}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t-2 border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 uppercase mb-1">Stock</span>
                    <span className="font-mono text-xs text-slate-900 font-black">{preset.boardWidth}" x {preset.boardThickness}"</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-slate-100 pl-4">
                    <span className="text-[9px] font-black text-slate-300 uppercase mb-1">Slope</span>
                    <span className="font-mono text-xs text-slate-900 font-black">1:{preset.angle}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onSelect(preset)}
                className="mt-8 w-full py-4 bg-white border-2 border-slate-900 text-black hover:bg-black hover:text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.3em] shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                Apply Blueprint
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
