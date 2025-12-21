
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { JointConfig, JointSegment } from '../types.ts';
import { WOOD_PROFILES } from '../constants.ts';

interface ShopFloorProps {
  config: JointConfig;
  onBack: () => void;
}

const ShopFloor: React.FC<ShopFloorProps> = ({ config, onBack }) => {
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const meshesRef = useRef<{
    front?: THREE.Mesh;
    back?: THREE.Mesh;
    left?: THREE.Mesh;
    right?: THREE.Mesh;
  }>({});

  // Procedural Geometry Engine
  const createDovetailBoard = (w: number, h: number, t: number, isPinBoard: boolean) => {
    const shape = new THREE.Shape();
    const run = t / config.angle;
    const r = config.minToolSize / 2;

    shape.moveTo(0, 0);
    shape.lineTo(w, 0);
    let curY = 0;
    config.layout.forEach((s) => {
      const nextY = curY + s.width;
      const midY = curY + s.width / 2;
      if (isPinBoard) {
        if (s.type === 'pin' || s.type === 'half-pin') {
          shape.lineTo(w, curY);
          if (config.useDogbones) {
            shape.absarc(w, curY, r, Math.PI, 1.5 * Math.PI, true);
          }
          shape.lineTo(w + t, midY - (s.width / 2 - run));
          shape.lineTo(w + t, midY + (s.width / 2 - run));
          if (config.useDogbones) {
            shape.absarc(w, nextY, r, 0.5 * Math.PI, Math.PI, true);
          }
          shape.lineTo(w, nextY);
        } else { shape.lineTo(w, nextY); }
      } else {
        if (s.type === 'tail') {
          shape.lineTo(w, curY);
          if (config.useDogbones) {
            shape.absarc(w - t, midY - (s.width / 2 - run), r, 0, Math.PI, false);
          }
          shape.lineTo(w - t, midY - (s.width / 2 - run));
          shape.lineTo(w - t, midY + (s.width / 2 - run));
          if (config.useDogbones) {
            shape.absarc(w - t, midY + (s.width / 2 - run), r, Math.PI, 0, false);
          }
          shape.lineTo(w, nextY);
        } else { shape.lineTo(w, nextY); }
      }
      curY = nextY;
    });
    shape.lineTo(0, h);
    curY = h;
    [...config.layout].reverse().forEach((s) => {
      const nextY = curY - s.width;
      const midY = curY - s.width / 2;
      if (isPinBoard) {
        if (s.type === 'pin' || s.type === 'half-pin') {
          shape.lineTo(0, curY);
          if (config.useDogbones) {
            shape.absarc(0, curY, r, 1.5 * Math.PI, 0, true);
          }
          shape.lineTo(-t, midY + (s.width / 2 - run));
          shape.lineTo(-t, midY - (s.width / 2 - run));
          if (config.useDogbones) {
            shape.absarc(0, nextY, r, 0, 0.5 * Math.PI, true);
          }
          shape.lineTo(0, nextY);
        } else { shape.lineTo(0, nextY); }
      } else {
        if (s.type === 'tail') {
          shape.lineTo(0, curY);
          if (config.useDogbones) {
            shape.absarc(t, midY + (s.width / 2 - run), r, Math.PI, 0, false);
          }
          shape.lineTo(t, midY + (s.width / 2 - run));
          shape.lineTo(t, midY - (s.width / 2 - run));
          if (config.useDogbones) {
            shape.absarc(t, midY - (s.width / 2 - run), r, 0, Math.PI, false);
          }
          shape.lineTo(0, nextY);
        } else { shape.lineTo(0, nextY); }
      }
      curY = nextY;
    });
    return new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
  };

  useEffect(() => {
    if (!threeContainerRef.current) return;
    const container = threeContainerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(22, 18, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10, 25, 15);
    light.castShadow = true;
    scene.add(light);

    const frontBackMat = new THREE.MeshStandardMaterial({ color: '#D4A373' });
    const sidesMat = new THREE.MeshStandardMaterial({ color: '#A98467' });

    const front = new THREE.Mesh(createDovetailBoard(config.boxWidth, config.boxHeight, config.boardThickness, true), frontBackMat);
    const back = new THREE.Mesh(createDovetailBoard(config.boxWidth, config.boxHeight, config.boardThickness, true), frontBackMat);
    back.rotation.y = Math.PI;
    const left = new THREE.Mesh(createDovetailBoard(config.boxDepth, config.boxHeight, config.boardThickness, false), sidesMat);
    left.rotation.y = -Math.PI / 2;
    const right = new THREE.Mesh(createDovetailBoard(config.boxDepth, config.boxHeight, config.boardThickness, false), sidesMat);
    right.rotation.y = Math.PI / 2;

    scene.add(front, back, left, right);
    meshesRef.current = { front, back, left, right };

    const animate = () => {
      const duration = 4000;
      const moveInTime = 1000;
      const pauseTime = 2000;
      const moveOutTime = 1000;

      const elapsed = (Date.now() - startTimeRef.current) % duration;
      let factor = 0;

      if (elapsed < moveInTime) {
        factor = 1 - (elapsed / moveInTime);
      } else if (elapsed < moveInTime + pauseTime) {
        factor = 0;
      } else {
        factor = (elapsed - (moveInTime + pauseTime)) / moveOutTime;
      }

      const offset = factor * 4;

      if (front) front.position.set(-config.boxWidth / 2, -config.boxHeight / 2, (config.boxDepth / 2 - config.boardThickness) + offset);
      if (back) back.position.set(config.boxWidth / 2, -config.boxHeight / 2, (-config.boxDepth / 2 + config.boardThickness) - offset);
      if (left) left.position.set(-config.boxWidth / 2 + config.boardThickness - offset, -config.boxHeight / 2, -config.boxDepth / 2);
      if (right) right.position.set(config.boxWidth / 2 - config.boardThickness + factor, -config.boxHeight / 2, config.boxDepth / 2);

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [config]);

  const ShopTicket = ({ name, material, boardType, width, height, thickness, layout }: { name: string, material: string, boardType: 'PINS' | 'TAILS', width: number, height: number, thickness: number, layout: JointSegment[] }) => {
    const scale = 30;
    const run = scale * (thickness / config.angle);
    const proudHeight = (thickness + 0.005).toFixed(3);
    const dbRadius = config.minToolSize / 2;
    
    return (
      <div className="bg-white thick-border shadow-[8px_8px_0_0_#000] flex flex-col">
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <div>
            <h4 className="text-xl font-black uppercase tracking-tight">{name}</h4>
            <p className="text-[10px] font-mono font-bold opacity-60">{material} | QTY: 1 OF 1</p>
          </div>
          <div className="text-[10px] font-black uppercase border border-white/20 px-3 py-1">
            {boardType} MANIFEST
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* SVG DRAWING */}
          <div className="flex justify-center bg-[#fafafa] p-6 border-2 border-black/5">
            <svg width={width * scale + 80} height={height * scale + 40} viewBox={`-40 -20 ${width * scale + 80} ${height * scale + 40}`}>
              <rect x="0" y="0" width={width * scale} height={height * scale} fill="none" stroke="black" strokeWidth="2" strokeDasharray="4 2" />
              
              <g>
                {layout.map((s, i) => {
                  let y = 0;
                  for (let j = 0; j < i; j++) y += layout[j].width;
                  const segWidth = s.width * scale;
                  const midY = (y * scale) + segWidth / 2;
                  const labelY = (y * scale);
                  
                  return (
                    <g key={s.id}>
                      {boardType === 'PINS' ? (
                        (s.type === 'pin' || s.type === 'half-pin') && (
                          <>
                            <path d={`M ${width * scale} ${y * scale} L ${width * scale + thickness * scale} ${midY - (segWidth/2 - run)} L ${width * scale + thickness * scale} ${midY + (segWidth/2 - run)} L ${width * scale} ${(y + s.width) * scale}`} fill="rgba(0,0,0,0.1)" stroke="black" strokeWidth="1" />
                            {config.useDogbones && (
                              <>
                                <circle cx={width * scale} cy={midY - (segWidth/2 - run)} r={dbRadius * scale} fill="white" stroke="black" strokeWidth="0.5" />
                                <circle cx={width * scale} cy={midY + (segWidth/2 - run)} r={dbRadius * scale} fill="white" stroke="black" strokeWidth="0.5" />
                              </>
                            )}
                            <path d={`M 0 ${y * scale} L ${-thickness * scale} ${midY - (segWidth/2 - run)} L ${-thickness * scale} ${midY + (segWidth/2 - run)} L 0 ${(y + s.width) * scale}`} fill="rgba(0,0,0,0.1)" stroke="black" strokeWidth="1" />
                            {config.useDogbones && (
                              <>
                                <circle cx={0} cy={midY - (segWidth/2 - run)} r={dbRadius * scale} fill="white" stroke="black" strokeWidth="0.5" />
                                <circle cx={0} cy={midY + (segWidth/2 - run)} r={dbRadius * scale} fill="white" stroke="black" strokeWidth="0.5" />
                              </>
                            )}
                            <text x={-35} y={labelY + 5} className="text-[7px] font-mono fill-red-600 font-bold">{y.toFixed(3)}"</text>
                            <line x1={-10} y1={labelY} x2={0} y2={labelY} stroke="red" strokeWidth="0.5" />
                          </>
                        )
                      ) : (
                        s.type === 'tail' && (
                          <>
                            <path d={`M ${width * scale} ${y * scale} L ${width * scale - thickness * scale} ${midY - (segWidth/2 - run)} L ${width * scale - thickness * scale} ${midY + (segWidth/2 - run)} L ${width * scale} ${(y + s.width) * scale}`} fill="rgba(0,0,0,0.05)" stroke="black" strokeWidth="1" />
                            {config.useDogbones && (
                              <>
                                <circle cx={width * scale - thickness * scale} cy={midY - (segWidth/2 - run)} r={dbRadius * scale} fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="2,2" />
                                <circle cx={width * scale - thickness * scale} cy={midY + (segWidth/2 - run)} r={dbRadius * scale} fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="2,2" />
                              </>
                            )}
                            <path d={`M 0 ${y * scale} L ${thickness * scale} ${midY - (segWidth/2 - run)} L ${thickness * scale} ${midY + (segWidth/2 - run)} L 0 ${(y + s.width) * scale}`} fill="rgba(0,0,0,0.05)" stroke="black" strokeWidth="1" />
                            {config.useDogbones && (
                              <>
                                <circle cx={thickness * scale} cy={midY - (segWidth/2 - run)} r={dbRadius * scale} fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="2,2" />
                                <circle cx={thickness * scale} cy={midY + (segWidth/2 - run)} r={dbRadius * scale} fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="2,2" />
                              </>
                            )}
                            <text x={-35} y={labelY + 5} className="text-[7px] font-mono fill-red-600 font-bold">{y.toFixed(3)}"</text>
                            <line x1={-10} y1={labelY} x2={0} y2={labelY} stroke="red" strokeWidth="0.5" />
                          </>
                        )
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* DATA TABLE */}
          <div className="grid grid-cols-2 gap-8 font-mono">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-gray-400">Final Cut Dims</h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-black/10 pb-1"><span>LENGTH:</span><b>{width.toFixed(3)}"</b></div>
                <div className="flex justify-between border-b border-black/10 pb-1"><span>WIDTH:</span><b>{height.toFixed(3)}"</b></div>
                <div className="flex justify-between border-b border-black/10 pb-1"><span>DEPTH:</span><b>{thickness.toFixed(3)}"</b></div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-gray-400">Router Setup</h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-black/10 pb-1"><span>BIT SZ:</span><b>{config.minToolSize}"</b></div>
                <div className="flex justify-between border-b border-black/10 pb-1"><span>SLOPE:</span><b>1:{config.angle}</b></div>
                <div className="flex justify-between border-b border-black/10 pb-1 text-safety-orange font-bold"><span>HEIGHT:</span><b>{proudHeight}" (Proud)</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5] overflow-y-auto overflow-x-hidden">
      {/* TOP SECTION: ANIMATED DEMO */}
      <section className="h-[45vh] w-full relative border-b-4 border-black bg-white flex-shrink-0">
        <div ref={threeContainerRef} className="w-full h-full" />
        <div className="absolute top-8 left-10 pointer-events-none select-none">
          <h2 className="text-5xl font-black uppercase tracking-tighter text-black leading-none">PHASE 4: SHOP FLOOR</h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-[0.4em] mt-2">Piston-Fit Calibration & Manifest</p>
        </div>
        <div className="absolute top-8 right-10 bg-black text-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Auto-Play Loop: Functional Verification
        </div>
        <button onClick={onBack} className="absolute bottom-8 right-10 btn-secondary bg-white shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]">
          ← RETURN TO STUDIO
        </button>
      </section>

      {/* BOTTOM SECTION: COMPONENT MANIFEST */}
      <section className="p-12 max-w-[1400px] mx-auto w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ShopTicket 
            name="CUT SHEET 01: FRONT" 
            material={config.woodType}
            boardType="PINS" 
            width={config.boxWidth} 
            height={config.boxHeight} 
            thickness={config.boardThickness} 
            layout={config.layout} 
          />
          <ShopTicket 
            name="CUT SHEET 02: BACK" 
            material={config.woodType}
            boardType="PINS" 
            width={config.boxWidth} 
            height={config.boxHeight} 
            thickness={config.boardThickness} 
            layout={config.layout} 
          />
          <ShopTicket 
            name="CUT SHEET 03: LEFT" 
            material={config.woodType}
            boardType="TAILS" 
            width={config.boxDepth} 
            height={config.boxHeight} 
            thickness={config.boardThickness} 
            layout={config.layout} 
          />
          <ShopTicket 
            name="CUT SHEET 04: RIGHT" 
            material={config.woodType}
            boardType="TAILS" 
            width={config.boxDepth} 
            height={config.boxHeight} 
            thickness={config.boardThickness} 
            layout={config.layout} 
          />
        </div>

        <div className="bg-white thick-border p-10 flex flex-col md:flex-row justify-between items-center gap-10 shadow-[12px_12px_0_0_#FF6B00]">
          <div className="space-y-3">
            <h3 className="text-3xl font-black uppercase tracking-tight">MANUFACTURING PDF EXPORT</h3>
            <p className="text-gray-500 font-mono text-xs leading-relaxed max-w-2xl">
              Project serialized with {config.pinStrategy} strategy for {config.woodType}. 
              All start points marked with 0.001" precision. Print these tickets and adhere to stock before milling.
            </p>
          </div>
          <button 
            onClick={() => window.print()} 
            className="btn-primary whitespace-nowrap px-10 py-6 text-lg hover:shadow-[8px_8px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            PRINT SHOP TICKETS <i className="fa-solid fa-file-pdf ml-3"></i>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ShopFloor;
