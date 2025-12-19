import React, { useState, useEffect, useCallback } from 'react';
import { JointConfig, AIAdvice } from './types.ts';
import { DEFAULT_CONFIG } from './constants.ts';
import ConfigPanel from './components/ConfigPanel.tsx';
import Schematic from './components/Schematic.tsx';
import Gallery from './components/Gallery.tsx';
import { getAIWoodworkingAdvice } from './services/geminiService.ts';

const App: React.FC = () => {
  const [config, setConfig] = useState<JointConfig>(DEFAULT_CONFIG);
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);
  const [hasKey, setHasKey] = useState<boolean>(true); // Assume true until check
  const [checkingKey, setCheckingKey] = useState<boolean>(true);

  const checkApiKey = useCallback(async () => {
    try {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } catch (e) {
      console.warn("API Key check not available in this environment", e);
    } finally {
      setCheckingKey(false);
    }
  }, []);

  const handleOpenKeySelector = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

  const fetchAdvice = useCallback(async (currentConfig: JointConfig) => {
    setLoadingAdvice(true);
    const result = await getAIWoodworkingAdvice(currentConfig);
    setAdvice(result);
    setLoadingAdvice(false);
  }, []);

  useEffect(() => {
    checkApiKey();
    fetchAdvice(config);
  }, []);

  const handleConfigChange = (newConfig: JointConfig) => {
    setConfig(newConfig);
  };

  const handleApplyPreset = (preset: JointConfig) => {
    setConfig(preset);
    fetchAdvice(preset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <i className="fa-solid fa-compass-drafting text-4xl text-amber-500 animate-spin"></i>
           <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Initializing Workbench...</p>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"></div>
          <div className="mb-8">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <i className="fa-solid fa-bolt text-3xl text-amber-500"></i>
            </div>
            <h1 className="text-3xl font-black text-white mb-4">ACTIVATE PRO ENGINE</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              To use high-speed layout optimization and real-time woodworking advice, connect your Google Cloud Project API key.
            </p>
          </div>
          
          <button 
            onClick={handleOpenKeySelector}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-amber-900/20 mb-6 flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            <i className="fa-solid fa-plug"></i>
            Select API Key
          </button>
          
          <div className="pt-6 border-t border-slate-800">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-amber-500/60 hover:text-amber-500 underline transition-colors"
            >
              Learn about Gemini API Billing
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20">
              <i className="fa-solid fa-layer-group text-slate-900 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 tracking-tight">
                DOVETAIL <span className="text-amber-500">MASTER</span> PRO
              </h1>
              <div className="flex items-center gap-2">
                 <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                   <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                   Engine Online
                 </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Powered By</span>
               <span className="text-xs font-black text-slate-300 flex items-center gap-2">
                 <i className="fa-solid fa-bolt text-amber-500"></i>
                 Gemini 3.0 Flash
               </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Column: Configuration */}
          <div className="w-full lg:w-[420px] shrink-0 space-y-6">
             <ConfigPanel config={config} onChange={handleConfigChange} />
             
             {/* AI Advice Card */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
               {loadingAdvice ? (
                 <div className="flex items-center gap-4 text-slate-500 animate-pulse py-4">
                   <i className="fa-solid fa-microchip text-xl"></i>
                   <span className="font-mono text-xs uppercase tracking-widest">Analyzing Geometry...</span>
                 </div>
               ) : advice ? (
                 <div className="space-y-4">
                   <div>
                     <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <i className="fa-solid fa-robot"></i> Analysis
                     </h3>
                     <p className="text-sm text-slate-300 font-medium leading-relaxed">
                       {advice.recommendation}
                     </p>
                   </div>
                   
                   <div className="pt-4 border-t border-slate-800">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Master Tips</p>
                     <ul className="space-y-2">
                       {advice.proTips.map((tip, idx) => (
                         <li key={idx} className="flex gap-3 text-xs text-slate-400 items-start">
                           <i className="fa-solid fa-check text-green-500 mt-0.5"></i>
                           <span>{tip}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 </div>
               ) : null}
             </div>
          </div>

          {/* Right Column: Visualization */}
          <div className="flex-1 w-full min-w-0">
             <Schematic config={config} onChange={handleConfigChange} />
             <div className="mt-8">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">System Output</h2>
                 <span className="text-[10px] font-mono text-slate-600">v3.0.1-stable</span>
               </div>
               <div className="bg-black/50 rounded-xl p-4 font-mono text-xs text-slate-500 flex justify-between items-center border border-white/5">
                  <span>RENDER_ENGINE: <span className="text-green-500">READY</span></span>
                  <span>SVG_EXPORT: <span className="text-green-500">ENABLED</span></span>
               </div>
             </div>
          </div>

        </div>

        {/* Gallery Section */}
        <Gallery onSelect={handleApplyPreset} />
      </main>
    </div>
  );
};

export default App;