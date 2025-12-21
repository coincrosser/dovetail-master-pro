
import React, { useState, useEffect } from 'react';
import { JOINT_PRESETS } from '../constants.ts';

interface CuratorToolsProps {
  isOpen: boolean;
  onClose: () => void;
}

const CuratorTools: React.FC<CuratorToolsProps> = ({ isOpen, onClose }) => {
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current: Record<string, string> = {};
      JOINT_PRESETS.forEach(p => {
        const local = localStorage.getItem(`dovetail_asset_${p.id}`);
        if (local) current[p.id] = local;
      });
      setAssets(current);
    }
  }, [isOpen]);

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveId(null);
    if (e.dataTransfer.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        localStorage.setItem(`dovetail_asset_${id}`, result);
        setAssets(prev => ({ ...prev, [id]: result }));
        // Dispatch event to update Gallery immediately
        window.dispatchEvent(new Event('curator-asset-update'));
      };
      reader.readAsDataURL(e.dataTransfer.files[0]);
    }
  };

  const generateCode = () => {
    // Generates the constants.ts content with the Base64 strings embedded
    const presetCode = JOINT_PRESETS.map(p => {
        const img = assets[p.id] || p.imageUrl || '';
        // We only want to output the relevant fields to keep it compact if possible, 
        // but for a full replacement we need the full object structure.
        return `  {
    id: '${p.id}',
    name: '${p.name}',
    description: '${p.description.replace(/'/g, "\\'")}',
    boardWidth: ${p.boardWidth},
    boardThickness: ${p.boardThickness},
    pinWidth: ${p.pinWidth},
    numTails: ${p.numTails},
    angle: ${p.angle},
    woodType: WoodType.${p.woodType},
    difficulty: '${p.difficulty}',
    recommendedWood: '${p.recommendedWood}',
    context: '${p.context}',
    history: '${p.history.replace(/'/g, "\\'")}',
    imageUrl: '${img}', // HOSTED MASTERPIECE ASSET
    technicalDetails: ${JSON.stringify(p.technicalDetails, null, 6).replace(/\[\s+/g, '[').replace(/\s+\]/g, ']')}
  }`;
    }).join(',\n');

    return `// PASTE THIS INTO constants.ts to DEPLOY
export const JOINT_PRESETS: JointPreset[] = [
${presetCode}
];`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[2rem] border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <i className="fa-solid fa-layer-group text-amber-500"></i>
              Curator Console
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Upload Masterpieces locally, then export the code to deploy them permanently.
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Upload Grid */}
          <div className="w-1/2 p-8 overflow-y-auto border-r border-slate-800 space-y-6">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">1. Upload Assets (Preview)</h3>
            <div className="grid grid-cols-2 gap-4">
              {JOINT_PRESETS.map(preset => (
                <div 
                  key={preset.id}
                  className="aspect-square bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-amber-500/50 transition-colors"
                  onDragOver={(e) => { e.preventDefault(); setDragActiveId(preset.id); }}
                  onDragLeave={() => setDragActiveId(null)}
                  onDrop={(e) => handleDrop(e, preset.id)}
                >
                  {assets[preset.id] ? (
                    <>
                        <img src={assets[preset.id]} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] uppercase font-bold text-white tracking-widest">Drop to Replace</span>
                        </div>
                    </>
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center ${dragActiveId === preset.id ? 'bg-amber-900/20' : ''}`}>
                       <i className="fa-solid fa-upload text-slate-700 text-2xl mb-2"></i>
                       <span className="text-[9px] text-slate-500 uppercase font-bold">Drag Image Here</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 p-2 border-t border-slate-800">
                    <p className="text-[9px] font-black text-white truncate text-center">{preset.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code Generation */}
          <div className="w-1/2 p-8 bg-[#0d1117] overflow-hidden flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">2. Deploy to Codebase</h3>
                <button 
                  onClick={() => navigator.clipboard.writeText(generateCode())}
                  className="text-[10px] font-bold bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors"
                >
                  <i className="fa-regular fa-copy mr-2"></i> Copy Code
                </button>
             </div>
             <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-800">
                <textarea 
                  readOnly 
                  className="w-full h-full bg-[#0d1117] text-slate-400 font-mono text-[10px] p-4 resize-none outline-none leading-relaxed"
                  value={generateCode()}
                />
             </div>
             <p className="text-[10px] text-slate-500 mt-4 text-center">
               Copy this block and replace <span className="text-amber-500 font-mono">export const JOINT_PRESETS</span> in <span className="text-white font-mono">constants.ts</span>.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratorTools;
