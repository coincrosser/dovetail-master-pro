
import React from 'react';
import { JointConfig, WoodType, PinLogicStrategy } from '../types.ts';
import { WOOD_PROFILES } from '../constants.ts';

interface StudioProps {
  config: JointConfig;
  onUpdate: (updates: Partial<JointConfig>) => void;
  onProceed: () => void;
}

const Studio: React.FC<StudioProps> = ({ config, onUpdate, onProceed }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Dimensions Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tight mb-2">The Studio</h2>
            <p className="text-gray-500 font-mono text-sm">Define your structural parameters.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Box Width (X)', key: 'boxWidth' },
              { label: 'Box Depth (Z)', key: 'boxDepth' },
              { label: 'Box Height (Y)', key: 'boxHeight' },
              { label: 'Stock Thick.', key: 'boardThickness' }
            ].map(d => (
              <div key={d.key} className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest">{d.label}</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={(config as any)[d.key]} 
                  onChange={e => onUpdate({ [d.key]: parseFloat(e.target.value) })}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest">Min. Tool Diameter (CNC)</label>
            <input 
              type="number" 
              step="0.001"
              value={config.minToolSize} 
              onChange={e => onUpdate({ minToolSize: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
        </section>

        {/* Constraints Section */}
        <section className="space-y-8 lg:border-l-2 lg:border-black lg:pl-12">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest">Pin Strategy</label>
              <select 
                value={config.pinStrategy}
                onChange={e => onUpdate({ pinStrategy: e.target.value as PinLogicStrategy })}
                className="input-field"
              >
                <option value={PinLogicStrategy.TRADITIONAL}>Traditional (1:3)</option>
                <option value={PinLogicStrategy.LONDON}>London Pattern (Thin Pins)</option>
                <option value={PinLogicStrategy.EQUIDISTANT}>Equidistant (Strongest)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest">Material Fiber</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(WOOD_PROFILES).map(([key, prof]) => (
                  <button 
                    key={key}
                    onClick={() => onUpdate({ woodType: key as WoodType })}
                    className={`p-3 text-[9px] font-black uppercase border-2 border-black transition-all ${config.woodType === key ? 'bg-black text-white' : 'bg-white text-black'}`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest">Tail Density</label>
                <span className="font-mono font-bold">{config.numTails}</span>
              </div>
              <input 
                type="range" min="1" max="15" 
                value={config.numTails} 
                onChange={e => onUpdate({ numTails: parseInt(e.target.value) })}
                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer group pt-4">
              <input 
                type="checkbox" 
                checked={config.useDogbones}
                onChange={e => onUpdate({ useDogbones: e.target.checked })}
                className="w-5 h-5 border-2 border-black rounded-none appearance-none checked:bg-black transition-colors"
              />
              <span className="text-xs font-black uppercase tracking-widest">Enable Dogbone Relief (CNC)</span>
            </label>
          </div>

          <button onClick={onProceed} className="btn-primary w-full mt-8">
            Approve Specs & Generate Blueprint <i className="fa-solid fa-arrow-right"></i>
          </button>
        </section>

      </div>
    </div>
  );
};

export default Studio;
