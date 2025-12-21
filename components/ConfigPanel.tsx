import React from 'react';
import { JointConfig, WoodType, PinLogicStrategy, JointAngle, FitTolerance } from '../types.ts';
import { WOOD_PROFILES } from '../constants.ts';

interface ConfigPanelProps {
  config: JointConfig;
  onChange: (updates: Partial<JointConfig>) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  return (
    <div className="bg-[#121212] p-6 lg:p-8 space-y-8 overflow-y-auto h-full border-r border-white/5 custom-scrollbar pb-32">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Project Setup</h2>
        <p className="text-[10px] text-tool-cyan font-bold uppercase tracking-[0.3em]">Restoration Logic v6.0</p>
      </div>

      <div className="space-y-8">
        {/* DIMENSIONS */}
        <section className="space-y-4">
          <h3 className="text-[9px] text-white/40 font-black uppercase tracking-widest border-b border-white/5 pb-2">Physical Dimensions (IN)</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Width', key: 'boxWidth' },
              { label: 'Depth', key: 'boxDepth' },
              { label: 'Height', key: 'boxHeight' },
              { label: 'Stock', key: 'boardThickness' }
            ].map(d => (
              <div key={d.key} className="space-y-1">
                <label className="text-[8px] font-black uppercase text-slate-500">{d.label}</label>
                <input 
                  type="number" step="0.1"
                  value={(config as any)[d.key]} 
                  onChange={e => onChange({ [d.key]: parseFloat(e.target.value) })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded p-2 text-xs font-bold text-white outline-none focus:border-tool-cyan transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* MATERIAL */}
        <section className="space-y-4">
           <h3 className="text-[9px] text-white/40 font-black uppercase tracking-widest border-b border-white/5 pb-2">Material Physics</h3>
           <div className="grid grid-cols-1 gap-2">
              {Object.entries(WOOD_PROFILES).map(([key, prof]) => (
                <button 
                  key={key}
                  onClick={() => onChange({ woodType: key as WoodType })}
                  className={`flex items-center justify-between p-3 rounded border text-[10px] font-black uppercase tracking-widest transition-all ${config.woodType === key ? 'bg-white text-black border-white' : 'border-white/10 text-slate-400'}`}
                >
                  {prof.label}
                  <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: prof.color }}></div>
                </button>
              ))}
           </div>
        </section>

        {/* PIN STRATEGY */}
        <section className="space-y-4">
           <h3 className="text-[9px] text-tool-cyan font-black uppercase tracking-widest border-b border-tool-cyan/20 pb-2">Pin Strategy</h3>
           <select 
             value={config.pinStrategy}
             onChange={e => onChange({ pinStrategy: e.target.value as PinLogicStrategy })}
             className="w-full bg-[#1a1a1a] border border-white/10 rounded p-3 text-[10px] font-black uppercase text-white outline-none"
           >
             <option value={PinLogicStrategy.TRADITIONAL}>Traditional (1:3)</option>
             <option value={PinLogicStrategy.LONDON}>London Pattern (Fixed Thin)</option>
             <option value={PinLogicStrategy.EQUIDISTANT}>Equidistant (1:1)</option>
           </select>
        </section>

        {/* TWEAKS */}
        <section className="space-y-4">
           <h3 className="text-[9px] text-white/40 font-black uppercase tracking-widest border-b border-white/5 pb-2">Fabrication Tweaks</h3>
           <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={config.fitTolerance === FitTolerance.GLUE_GAP}
                  onChange={e => onChange({ fitTolerance: e.target.checked ? FitTolerance.GLUE_GAP : FitTolerance.SNUG })}
                  className="w-3 h-3 rounded border-white/10"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">Apply Glue Gap (0.005")</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={config.useDogbones}
                  onChange={e => onChange({ useDogbones: e.target.checked })}
                  className="w-3 h-3 rounded border-white/10"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">Dogbone Corners (CNC)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={config.avoidBottomGroove}
                  onChange={e => onChange({ avoidBottomGroove: e.target.checked })}
                  className="w-3 h-3 rounded border-white/10"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">Drawer Groove Avoidance</span>
              </label>
           </div>
        </section>

        {/* DENSITY */}
        <section className="space-y-4">
           <div className="flex justify-between items-center">
             <h3 className="text-[9px] text-white/40 font-black uppercase tracking-widest">Tail Density</h3>
             <span className="text-tool-cyan font-black text-xs">{config.numTails}</span>
           </div>
           <input 
             type="range" min="1" max="12" 
             value={config.numTails} 
             onChange={e => onChange({ numTails: parseInt(e.target.value) })}
             className="w-full"
           />
        </section>
      </div>
    </div>
  );
};

export default ConfigPanel;