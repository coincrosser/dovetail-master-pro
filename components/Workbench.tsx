
import React, { useRef } from 'react';
import { JointConfig } from '../types.ts';
import { WOOD_PROFILES } from '../constants.ts';

// Declare html2pdf for TypeScript compatibility with the external library
declare const html2pdf: any;

interface WorkbenchProps {
  config: JointConfig;
  onProceed: () => void;
  onBack: () => void;
}

const Workbench: React.FC<WorkbenchProps> = ({ config, onProceed, onBack }) => {
  const scale = 40; // Pixels per inch for the blueprint
  const svgRef = useRef<SVGSVGElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Geometry Calculations
  const internalWidth = config.boxWidth - (2 * config.boardThickness);
  const internalDepth = config.boxDepth - (2 * config.boardThickness);
  const tailAngleDeg = (Math.atan(1 / config.angle) * 180 / Math.PI).toFixed(1);
  const slopeRun = config.boardThickness / config.angle;
  const dogboneRadius = config.minToolSize / 2;

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;

    // Clone and prepare SVG for standalone export
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("width", "1200"); // Standardized export width
    
    // Serializing to string with XML header
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([`<?xml version="1.0" standalone="no"?>\r\n`, svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `DovetailMaster_Blueprint_${config.boxWidth}x${config.boxHeight}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;
    
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: `Dovetail_ShopTicket_DM11_${Math.floor(Math.random() * 10000)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Use the html2pdf library to generate a high-fidelity PDF from the manifest DOM
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="h-full flex flex-col p-8 gap-8 overflow-y-auto bg-[#F5F5F7]">
      {/* PHASE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-6 gap-4 no-print">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tight">Phase 2: Workbench</h2>
          <p className="text-gray-500 font-mono text-sm italic">v11.0 Fabrication Intelligence</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button onClick={onBack} className="btn-secondary flex-1 md:flex-none">← EDIT STUDIO</button>
          <button onClick={onProceed} className="btn-primary flex-1 md:flex-none">
            APPROVE & RENDER 3D <i className="fa-solid fa-cube"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* MAIN BLUEPRINT VIEWER & PDF CAPTURE TARGET */}
        <div className="xl:col-span-8 bg-white thick-border p-8 md:p-12 overflow-x-auto min-h-[700px] flex flex-col items-center gap-12 relative shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]" ref={pdfRef}>
          <div className="absolute top-4 left-4 text-[10px] font-mono font-bold opacity-30 uppercase tracking-[0.2em]">
            SYSTEM_PROTOCOL: V11.0_PDF_ENGINE
          </div>
          
          <div className="w-full text-center border-b-2 border-black pb-4 mb-4">
             <h2 className="text-2xl font-black uppercase tracking-widest">Fabrication Manifest</h2>
             <p className="font-mono text-[10px] font-bold">UNITS: INCH | SCALE: NTS | REV: A</p>
          </div>

          <svg 
            ref={svgRef}
            viewBox={`-60 -60 ${(config.boxWidth * scale) + 120} ${(config.boxHeight * scale * 4.5)}`}
            className="w-full h-auto max-h-[85vh]"
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#FF0000" />
              </marker>
              <pattern id="blueprint-hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="4" stroke="black" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* SHEET 1: FRONT/BACK (PIN BOARDS) */}
            <g transform="translate(0, 0)">
              <text x="0" y="-30" fontSize="14" fontWeight="900" textAnchor="start" fill="#000" fontFamily="Inter, sans-serif">SHEET 01: FRONT / BACK PANEL (PINS)</text>
              
              {/* Board Outline */}
              <rect x="0" y="0" width={config.boxWidth * scale} height={config.boxHeight * scale} fill="none" stroke="black" strokeWidth="2" />
              
              {/* Joint Cuts Visualization */}
              {config.layout.map((seg, i) => {
                let yPos = 0;
                for(let j=0; j<i; j++) yPos += config.layout[j].width;
                
                if (seg.type === 'pin' || seg.type === 'half-pin') {
                  const midY = (yPos + seg.width / 2) * scale;
                  const run = (seg.width / 2 - slopeRun);
                  return (
                    <g key={seg.id}>
                      {/* Left Side Pins */}
                      <path 
                        d={`M 0 ${yPos * scale} L ${config.boardThickness * scale} ${midY - run * scale} L ${config.boardThickness * scale} ${midY + run * scale} L 0 ${(yPos + seg.width) * scale} Z`} 
                        fill="url(#blueprint-hatch)" stroke="black" strokeWidth="1"
                      />
                      {config.useDogbones && (
                        <>
                          <circle cx={config.boardThickness * scale} cy={midY - run * scale} r={dogboneRadius * scale} fill="white" stroke="black" strokeWidth="0.5" />
                          <circle cx={config.boardThickness * scale} cy={midY + run * scale} r={dogboneRadius * scale} fill="white" stroke="black" strokeWidth="0.5" />
                        </>
                      )}
                      {/* Right Side Pins */}
                      <path 
                        d={`M ${config.boxWidth * scale} ${yPos * scale} L ${(config.boxWidth - config.boardThickness) * scale} ${midY - run * scale} L ${(config.boxWidth - config.boardThickness) * scale} ${midY + run * scale} L ${config.boxWidth * scale} ${(yPos + seg.width) * scale} Z`} 
                        fill="url(#blueprint-hatch)" stroke="black" strokeWidth="1"
                      />
                      {config.useDogbones && (
                        <>
                          <circle cx={(config.boxWidth - config.boardThickness) * scale} cy={midY - run * scale} r={dogboneRadius * scale} fill="white" stroke="black" strokeWidth="0.5" />
                          <circle cx={(config.boxWidth - config.boardThickness) * scale} cy={midY + run * scale} r={dogboneRadius * scale} fill="white" stroke="black" strokeWidth="0.5" />
                        </>
                      )}
                    </g>
                  );
                }
                return null;
              })}

              {/* Dimensions */}
              <line x1={config.boardThickness * scale} y1="-15" x2={(config.boxWidth - config.boardThickness) * scale} y2="-15" stroke="#FF0000" strokeWidth="1" markerEnd="url(#arrowhead)" />
              <line x1={(config.boxWidth - config.boardThickness) * scale} y1="-15" x2={config.boardThickness * scale} y2="-15" stroke="#FF0000" strokeWidth="1" markerEnd="url(#arrowhead)" />
              <text x={(config.boxWidth / 2) * scale} y="-20" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FF0000" fontFamily="Roboto Mono, monospace">
                INT_WIDTH: {internalWidth.toFixed(3)}"
              </text>
            </g>

            {/* SHEET 2: SIDES (TAIL BOARDS) */}
            <g transform={`translate(0, ${(config.boxHeight * scale * 1.5)})`}>
              <text x="0" y="-30" fontSize="14" fontWeight="900" textAnchor="start" fill="#000" fontFamily="Inter, sans-serif">SHEET 02: SIDE PANELS (TAILS)</text>
              <rect x="0" y="0" width={config.boxDepth * scale} height={config.boxHeight * scale} fill="none" stroke="black" strokeWidth="2" />

              {config.layout.map((seg, i) => {
                let yPos = 0;
                for(let j=0; j<i; j++) yPos += config.layout[j].width;
                
                if (seg.type === 'tail') {
                  const midY = (yPos + seg.width / 2) * scale;
                  const run = (seg.width / 2 - slopeRun);
                  return (
                    <g key={`side-${seg.id}`}>
                      {/* Left Side Tails (Socket visualization) */}
                      <path 
                        d={`M 0 ${yPos * scale} L ${config.boardThickness * scale} ${midY - run * scale} L ${config.boardThickness * scale} ${midY + run * scale} L 0 ${(yPos + seg.width) * scale} Z`} 
                        fill="rgba(0,0,0,0.05)" stroke="black" strokeWidth="1" strokeDasharray="2,2"
                      />
                      {config.useDogbones && (
                        <>
                          <circle cx={config.boardThickness * scale} cy={midY - run * scale} r={dogboneRadius * scale} fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="2,2" />
                          <circle cx={config.boardThickness * scale} cy={midY + run * scale} r={dogboneRadius * scale} fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="2,2" />
                        </>
                      )}
                      {/* Right Side Tails */}
                      <path 
                        d={`M ${config.boxDepth * scale} ${yPos * scale} L ${(config.boxDepth - config.boardThickness) * scale} ${midY - run * scale} L ${(config.boxDepth - config.boardThickness) * scale} ${midY + run * scale} L ${config.boxDepth * scale} ${(yPos + seg.width) * scale} Z`} 
                        fill="rgba(0,0,0,0.05)" stroke="black" strokeWidth="1" strokeDasharray="2,2"
                      />
                      {config.useDogbones && (
                        <>
                          <circle cx={(config.boxDepth - config.boardThickness) * scale} cy={midY - run * scale} r={dogboneRadius * scale} fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="2,2" />
                          <circle cx={(config.boxDepth - config.boardThickness) * scale} cy={midY + run * scale} r={dogboneRadius * scale} fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="2,2" />
                        </>
                      )}
                    </g>
                  );
                }
                return null;
              })}

              <text x={(config.boxDepth - 0.5) * scale} y="20" fontSize="10" fontWeight="700" fill="#FF0000" fontFamily="Roboto Mono, monospace">
                SLOPE: 1:{config.angle} ({tailAngleDeg}°)
              </text>
            </g>
          </svg>

          {/* PDF INFO BLOCK */}
          <div className="w-full mt-12 grid grid-cols-2 gap-8 border-t-2 border-black pt-8">
             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Structural Specifications</p>
                <div className="font-mono text-[11px] font-bold">INT_WIDTH: {internalWidth.toFixed(4)}"</div>
                <div className="font-mono text-[11px] font-bold">STOCK_THICK: {config.boardThickness}"</div>
                <div className="font-mono text-[11px] font-bold">TOTAL_TAILS: {config.numTails}</div>
                <div className="font-mono text-[11px] font-bold">DOGBONES: {config.useDogbones ? 'ENABLED' : 'DISABLED'}</div>
             </div>
             <div className="space-y-2 text-right">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Router Tooling Config</p>
                <div className="font-mono text-[11px] font-bold">BIT_SZ: {config.minToolSize}"</div>
                <div className="font-mono text-[11px] font-bold text-red-600">DEPTH: {(config.boardThickness + 0.010).toFixed(3)}" (PROUD)</div>
                <div className="font-mono text-[11px] font-bold">SLOPE: 1:{config.angle}</div>
             </div>
          </div>
        </div>

        {/* EXPORT AND MANIFEST SIDEBAR */}
        <div className="xl:col-span-4 flex flex-col gap-6 no-print">
          <div className="bg-white thick-border p-6 shadow-[8px_8px_0_0_#000]">
            <h3 className="text-xl font-black uppercase border-b-2 border-black pb-4 mb-6 flex items-center gap-3">
              <i className="fa-solid fa-file-export"></i> Project Export
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={handleDownloadSVG}
                className="w-full py-4 thick-border bg-white text-black hover:bg-black hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-download"></i> Download Vector (.SVG)
              </button>
              
              <button 
                onClick={handleDownloadPDF}
                className="w-full py-4 thick-border bg-black text-white hover:bg-white hover:text-black transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-file-pdf"></i> Download PDF Ticket
              </button>
            </div>

            <div className="mt-10 space-y-4">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Engineering Specs</h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>STOCK THICK:</span>
                  <span className="font-bold">{config.boardThickness}"</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>TAIL ANGLE:</span>
                  <span className="font-bold">1:{config.angle} ({tailAngleDeg}°)</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>PIN STRATEGY:</span>
                  <span className="font-bold uppercase">{config.pinStrategy}</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>TOTAL TAILS:</span>
                  <span className="font-bold">{config.numTails}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-100 thick-border">
              <h4 className="text-[10px] font-black uppercase mb-1 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-blueprint-blue"></i> Artisan Note
              </h4>
              <p className="text-[10px] font-mono leading-tight text-gray-600">
                Verified for {WOOD_PROFILES[config.woodType].label}. This manifest includes a proud router depth for easier cleanup during final surfacing.
              </p>
            </div>
          </div>

          <div className="bg-blueprint-blue text-white thick-border p-6 shadow-[8px_8px_0_0_#000]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                 <i className="fa-solid fa-print text-xl"></i>
              </div>
              <div>
                <h4 className="text-[12px] font-black uppercase tracking-widest leading-none mb-1">PDF Engine Active</h4>
                <p className="text-[9px] font-bold opacity-70 uppercase">Ready for shop floor deployment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workbench;
