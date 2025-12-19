import React, { useRef, useState, useEffect, useMemo } from 'react';
import { JointConfig, WoodType } from '../types.ts';
import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'https://esm.sh/three@0.160.0/examples/jsm/exporters/GLTFExporter.js';

interface SchematicProps {
  config: JointConfig;
  onChange?: (config: JointConfig) => void;
}

const calculateJointGeometry = (config: JointConfig) => {
  const { boardWidth, boardThickness, boardLength, numTails, pinWidth, angle, tailWidthAtBase, tailWidthAtTop } = config;
  
  const minPinWidth = 0.03125;
  const safePinWidth = Math.max(pinWidth, minPinWidth);
  const run = boardThickness / (angle || 6);
  
  const totalPinSpace = (numTails - 1) * safePinWidth;
  const edgePinWidth = safePinWidth * 0.75;
  const availableForTails = boardWidth - totalPinSpace - (2 * edgePinWidth);
  
  const calculatedTopW = tailWidthAtTop || (availableForTails / numTails);
  const calculatedBaseW = tailWidthAtBase || (calculatedTopW - (2 * run));
  const effectiveRun = (calculatedTopW - calculatedBaseW) / 2;
  
  let currentY = edgePinWidth;
  const tails: Array<{baseY: number, topY: number, run: number}> = [];
  for (let i = 0; i < numTails; i++) {
    const tBase = currentY + effectiveRun;
    const tTop = tBase + calculatedBaseW;
    tails.push({ baseY: tBase, topY: tTop, run: effectiveRun });
    currentY = tTop + effectiveRun + (i < numTails - 1 ? safePinWidth : 0);
  }

  return {
    boardWidth,
    boardThickness,
    boardLength,
    tails,
    pinWidth: safePinWidth,
    edgePinWidth,
    slope: angle,
    tailBaseW: calculatedBaseW,
    tailTopW: calculatedTopW,
    effectiveRun
  };
};

const Schematic: React.FC<SchematicProps> = ({ config }) => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [isExploded, setIsExploded] = useState(false);
  const [isAutoAnimating, setIsAutoAnimating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const geometry = useMemo(() => calculateJointGeometry(config), [config]);

  const requestRef = useRef<number>(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const pinBoardRef = useRef<THREE.Group | null>(null);
  
  const isExplodedRef = useRef(isExploded);
  const isAutoAnimatingRef = useRef(isAutoAnimating);

  useEffect(() => { isExplodedRef.current = isExploded; }, [isExploded]);
  useEffect(() => { isAutoAnimatingRef.current = isAutoAnimating; }, [isAutoAnimating]);

  const createTextLabel = (text: string, color: string = '#fbbf24') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Sprite();
    
    canvas.width = 512;
    canvas.height = 128;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(32, 16, 448, 96, 24);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.font = 'bold 32px JetBrains Mono, monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 1, 1);
    sprite.renderOrder = 999;
    return sprite;
  };

  const createLeaderLine = (start: THREE.Vector3, end: THREE.Vector3, color: number = 0xfbbf24) => {
    const geometryLine = new THREE.BufferGeometry().setFromPoints([start, end]);
    const materialLine = new THREE.LineDashedMaterial({ color, transparent: true, opacity: 0.8, dashSize: 0.5, gapSize: 0.2, depthTest: false });
    const line = new THREE.Line(geometryLine, materialLine);
    line.computeLineDistances();
    line.renderOrder = 998;
    return line;
  };

  const handleExportGLB = () => {
    if (!sceneRef.current) return;
    setIsExporting(true);
    const exporter = new GLTFExporter();
    exporter.parse(sceneRef.current, (result) => {
        const blob = new Blob([result as ArrayBuffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `dovetail-joint-spec-${Date.now()}.glb`;
        link.click();
        setIsExporting(false);
      }, (e) => { console.error(e); setIsExporting(false); }, { binary: true }
    );
  };

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dovetail-blueprint-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (viewMode !== '3D' || !containerRef.current) return;
    const { boardWidth: bW, boardThickness: bT, boardLength: bL, tails, pinWidth, edgePinWidth, slope } = geometry;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(25, 20, 25);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    // LIGHTING
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(20, 40, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.radius = 4;
    scene.add(keyLight);

    const baseColor = config.woodType === WoodType.HARDWOOD ? 0x92400e : config.woodType === WoodType.SOFTWOOD ? 0xfcd34d : 0x451a03;
    const tailMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8 });
    const pinMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(baseColor).multiplyScalar(0.7), roughness: 0.7 });

    // BOARDS
    const tailShape = new THREE.Shape();
    tailShape.moveTo(-bL, 0); tailShape.lineTo(0, 0); tailShape.lineTo(0, edgePinWidth);
    tails.forEach((t, i) => {
        tailShape.lineTo(bT, t.baseY); tailShape.lineTo(bT, t.topY); tailShape.lineTo(0, t.topY + t.run);
        if (i < tails.length - 1) tailShape.lineTo(0, t.topY + t.run + pinWidth);
    });
    tailShape.lineTo(0, bW); tailShape.lineTo(-bL, bW); tailShape.closePath();
    
    const tailMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(tailShape, { depth: bT, bevelEnabled: false }), tailMat);
    tailMesh.rotation.x = -Math.PI / 2; tailMesh.position.y = bW / 2;
    tailMesh.castShadow = true; tailMesh.receiveShadow = true;
    const b1Group = new THREE.Group(); b1Group.add(tailMesh); scene.add(b1Group);

    // PIN BOARD
    const pinShape = new THREE.Shape();
    pinShape.moveTo(0, 0); pinShape.lineTo(bL, 0); pinShape.lineTo(bL, bW); pinShape.lineTo(0, bW);
    pinShape.lineTo(0, bW - edgePinWidth);
    for (let i = tails.length - 1; i >= 0; i--) {
      const t = tails[i]; pinShape.lineTo(-bT, t.topY); pinShape.lineTo(-bT, t.baseY); pinShape.lineTo(0, t.baseY - t.run);
      if (i > 0) pinShape.lineTo(0, t.baseY - t.run - pinWidth);
    }
    pinShape.closePath();

    const pinMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(pinShape, { depth: bT, bevelEnabled: false }), pinMat);
    pinMesh.rotation.y = Math.PI / 2; pinMesh.rotation.x = -Math.PI / 2; pinMesh.position.y = bW / 2;
    pinMesh.castShadow = true; pinMesh.receiveShadow = true;
    const pinGroup = new THREE.Group(); pinGroup.add(pinMesh); scene.add(pinGroup); pinBoardRef.current = pinGroup;

    // WORKSHOP DATA PLATE (For GLB context)
    const plate = createTextLabel(`SPEC: ${bW}"x${bT}"x${bL}" | Slope 1:${slope} | ${tails.length} Tails`, '#fbbf24');
    plate.position.set(-bL/2, bT + 5, -5);
    b1Group.add(plate);

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (pinBoardRef.current) {
        const targetZ = (isAutoAnimatingRef.current ? (Math.sin(Date.now()*0.001)*0.5+0.5)*12 : (isExplodedRef.current ? 12 : 0)) + bT/2;
        pinBoardRef.current.position.z = THREE.MathUtils.lerp(pinBoardRef.current.position.z, targetZ, 0.1);
      }
      if (rendererRef.current && sceneRef.current) rendererRef.current.render(sceneRef.current, camera);
    };
    animate();

    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); rendererRef.current?.dispose(); };
  }, [viewMode, geometry, config.woodType]);

  const scale = 120;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
      <div className="bg-slate-950 p-5 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
          <button onClick={() => setViewMode('2D')} className={`px-5 py-2 text-xs font-black rounded-lg transition-all ${viewMode === '2D' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}>2D BLUEPRINT</button>
          <button onClick={() => setViewMode('3D')} className={`px-5 py-2 text-xs font-black rounded-lg transition-all ${viewMode === '3D' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}>3D CAD VIEW</button>
        </div>
        <div className="flex gap-2">
           <button onClick={handleExportSVG} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2">
              <i className="fa-solid fa-file-code"></i> Export SVG
           </button>
          {viewMode === '3D' && (
             <>
               <button onClick={handleExportGLB} disabled={isExporting} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2">
                  <i className={`fa-solid ${isExporting ? 'fa-spinner animate-spin' : 'fa-file-export'}`}></i> Export GLB
               </button>
               <button onClick={() => setIsAutoAnimating(!isAutoAnimating)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all flex items-center gap-2 ${isAutoAnimating ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                  <i className={`fa-solid ${isAutoAnimating ? 'fa-pause' : 'fa-play'}`}></i> Animate
               </button>
               {!isAutoAnimating && (
                 <button onClick={() => setIsExploded(!isExploded)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all flex items-center gap-2 ${isExploded ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {isExploded ? 'Snap' : 'Explode'}
                 </button>
               )}
             </>
          )}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative bg-[#0a0f1d] overflow-hidden">
        <div className={`absolute inset-0 flex items-center justify-center p-20 transition-all duration-300 ${viewMode === '2D' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <div className="bg-slate-900/50 p-16 rounded-xl border border-slate-800 shadow-3xl backdrop-blur-sm relative">
              <svg ref={svgRef} width={geometry.boardWidth * scale + 240} height={geometry.boardThickness * scale + 100} viewBox={`-60 -120 ${geometry.boardWidth * scale + 300} ${geometry.boardThickness * scale + 220}`} className="overflow-visible bg-slate-900/40 p-10 rounded-lg">
                <path d={`M 0 ${geometry.boardThickness * scale} L 0 0 L ${geometry.edgePinWidth * scale + geometry.effectiveRun * scale} 0 ${geometry.tails.map((t, i) => `L ${t.baseY * scale} ${geometry.boardThickness * scale} L ${t.topY * scale} ${geometry.boardThickness * scale} L ${(t.topY + geometry.effectiveRun) * scale} 0 ${i < geometry.tails.length - 1 ? `L ${(t.topY + geometry.effectiveRun + geometry.pinWidth) * scale} 0` : ''}`).join(' ')} L ${geometry.boardWidth * scale} 0 L ${geometry.boardWidth * scale} ${geometry.boardThickness * scale} Z`} fill="#fbbf24" fillOpacity="0.05" stroke="#fbbf24" strokeWidth="2" />
                
                {/* WORKSHOP CONTEXT BOX */}
                <g transform={`translate(${geometry.boardWidth * scale + 40}, -80)`} fontFamily="JetBrains Mono" fontSize="10">
                   <rect width="220" height="180" fill="#0f172a" stroke="#1e293b" strokeWidth="1" rx="4" />
                   <text x="10" y="25" fill="#fbbf24" fontWeight="bold" fontSize="12">WORKSHOP SPECIFICATION</text>
                   <line x1="10" y1="35" x2="210" y2="35" stroke="#1e293b" />
                   <text x="15" y="60" fill="#94a3b8">MATERIAL: <tspan fill="#f8fafc">{config.woodType}</tspan></text>
                   <text x="15" y="80" fill="#94a3b8">WIDTH: <tspan fill="#f8fafc">{geometry.boardWidth}"</tspan></text>
                   <text x="15" y="100" fill="#94a3b8">LENGTH: <tspan fill="#f8fafc">{geometry.boardLength}"</tspan></text>
                   <text x="15" y="120" fill="#94a3b8">THICKNESS: <tspan fill="#f8fafc">{geometry.boardThickness}"</tspan></text>
                   <text x="15" y="140" fill="#94a3b8">SLOPE: <tspan fill="#f8fafc">1:{geometry.slope}</tspan></text>
                   <text x="15" y="160" fill="#94a3b8">TAILS: <tspan fill="#f8fafc">{geometry.tails.length}</tspan></text>
                </g>
              </svg>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Schematic;