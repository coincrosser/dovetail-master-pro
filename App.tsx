import React, { useState } from 'react';
import { JointConfig, JointSegment, PinLogicStrategy, WoodType } from './types.ts';
import { DEFAULT_CONFIG, WOOD_PROFILES } from './constants.ts';
import { solveJointLayout } from './utils/layoutEngine.ts';
import Studio from './components/Studio.tsx';
import Workbench from './components/Workbench.tsx';
import Showroom from './components/Showroom.tsx';
import ShopFloor from './components/ShopFloor.tsx';

export default function App() {
  const [config, setConfig] = useState<JointConfig>(() => {
    const layout = solveJointLayout(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG, layout };
  });

  const updateConfig = (updates: Partial<JointConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      // Sync angle to wood type
      if (updates.woodType) {
        next.angle = WOOD_PROFILES[updates.woodType as WoodType].angle;
      }
      next.layout = solveJointLayout(next);
      return next;
    });
  };

  const nextStep = () => {
    setConfig(prev => ({ ...prev, step: (prev.step + 1) as 1 | 2 | 3 | 4 }));
  };

  const prevStep = () => {
    setConfig(prev => ({ ...prev, step: (prev.step - 1) as 1 | 2 | 3 | 4 }));
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7] text-black">
      {/* HEADER */}
      <header className="px-8 py-6 border-b-4 border-black flex justify-between items-center bg-white z-50">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Dovetail PRO <span className="text-gray-400">v11.0</span></h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fabrication Intelligence Engine</p>
        </div>
        <div className="flex gap-4 items-center">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`w-8 h-8 flex items-center justify-center font-mono font-bold border-2 border-black ${config.step === s ? 'bg-black text-white' : 'bg-white'}`}>
              {s}
            </div>
          ))}
        </div>
      </header>

      {/* STEP CONTENT */}
      <main className="flex-1 overflow-hidden relative">
        {config.step === 1 && <Studio config={config} onUpdate={updateConfig} onProceed={nextStep} />}
        {config.step === 2 && <Workbench config={config} onProceed={nextStep} onBack={prevStep} />}
        {config.step === 3 && <Showroom config={config} onBack={prevStep} onFinalize={nextStep} />}
        {config.step === 4 && <ShopFloor config={config} onBack={prevStep} />}
      </main>

      {/* FOOTER */}
      <footer className="px-8 py-3 border-t-2 border-black bg-white flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
        <span>© 2025 Hookyard Engineering</span>
        <div className="flex gap-6">
          <span>Mode: {config.pinStrategy}</span>
          <span>Stock: {config.boardThickness}"</span>
          <span className="text-[#FF6B00]">Step {config.step} / 4</span>
        </div>
      </footer>
    </div>
  );
}