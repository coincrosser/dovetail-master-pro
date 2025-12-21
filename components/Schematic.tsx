
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { JointConfig, FitTolerance } from '../types.ts';
import { WOOD_PROFILES } from '../constants.ts';

interface SchematicProps {
  config: JointConfig;
  view: '2D' | '3D';
}

const Schematic: React.FC<SchematicProps> = ({ config, view }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view !== '3D' || !containerRef.current || !config.isGenerated) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Studio Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const spot = new THREE.SpotLight(0xffffff, 1.5);
    spot.position.set(10, 20, 10);
    spot.castShadow = true;
    scene.add(spot);

    const wood = WOOD_PROFILES[config.woodType];
    const material = new THREE.MeshStandardMaterial({ 
      color: wood.color, 
      roughness: wood.roughness,
      metalness: 0.1
    });

    const buildBoard = (w: number, h: number, t: number, isPinBoard: boolean) => {
      const shape = new THREE.Shape();
      const run = t / config.angle;
      const glueOffset = config.fitTolerance === FitTolerance.GLUE_GAP ? 0.005 : 0;
      const r = config.minToolSize / 2;

      shape.moveTo(0, 0);
      shape.lineTo(w, 0);

      // Right Side Joint
      let curY = 0;
      config.layout.forEach(s => {
        const nextY = curY + s.width;
        const midY = curY + s.width / 2;
        
        if (isPinBoard && (s.type === 'pin' || s.type === 'half-pin')) {
          shape.lineTo(w, curY + glueOffset);
          
          if (config.useDogbones) {
            shape.absarc(w, curY + glueOffset, r, Math.PI, 1.5 * Math.PI, true);
          }

          shape.lineTo(w + t, midY - (s.width / 2 - run));
          shape.lineTo(w + t, midY + (s.width / 2 - run));
          
          if (config.useDogbones) {
             shape.absarc(w, nextY - glueOffset, r, 0.5 * Math.PI, Math.PI, true);
          }
          
          shape.lineTo(w, nextY - glueOffset);
        } else if (!isPinBoard && s.type === 'tail') {
          shape.lineTo(w, curY + glueOffset);
          
          if (config.useDogbones) {
             shape.absarc(w - t, midY - (s.width / 2 - run), r, 0, Math.PI, false);
          }

          shape.lineTo(w - t, midY - (s.width / 2 - run));
          shape.lineTo(w - t, midY + (s.width / 2 - run));
          
          if (config.useDogbones) {
             shape.absarc(w - t, midY + (s.width / 2 - run), r, Math.PI, 0, false);
          }

          shape.lineTo(w, nextY - glueOffset);
        } else {
          shape.lineTo(w, nextY);
        }
        curY = nextY;
      });

      shape.lineTo(0, h);

      // Left Side Joint
      curY = h;
      [...config.layout].reverse().forEach(s => {
        const nextY = curY - s.width;
        const midY = curY - s.width / 2;

        if (isPinBoard && (s.type === 'pin' || s.type === 'half-pin')) {
          shape.lineTo(0, curY - glueOffset);
          
          if (config.useDogbones) {
            shape.absarc(0, curY - glueOffset, r, 1.5 * Math.PI, 0, true);
          }

          shape.lineTo(-t, midY + (s.width / 2 - run));
          shape.lineTo(-t, midY - (s.width / 2 - run));
          
          if (config.useDogbones) {
            shape.absarc(0, nextY + glueOffset, r, 0, 0.5 * Math.PI, true);
          }

          shape.lineTo(0, nextY + glueOffset);
        } else if (!isPinBoard && s.type === 'tail') {
          shape.lineTo(0, curY - glueOffset);
          
          if (config.useDogbones) {
            shape.absarc(t, midY + (s.width / 2 - run), r, Math.PI, 0, false);
          }

          shape.lineTo(t, midY + (s.width / 2 - run));
          shape.lineTo(t, midY - (s.width / 2 - run));
          
          if (config.useDogbones) {
            shape.absarc(t, midY - (s.width / 2 - run), r, 0, Math.PI, false);
          }

          shape.lineTo(0, nextY + glueOffset);
        } else {
          shape.lineTo(0, nextY);
        }
        curY = nextY;
      });

      return new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
    };

    // Construct Assembly
    const front = new THREE.Mesh(buildBoard(config.boxWidth, config.boxHeight, config.boardThickness, true), material);
    front.position.set(-config.boxWidth / 2, -config.boxHeight / 2, config.boxDepth / 2 - config.boardThickness);
    scene.add(front);

    const back = new THREE.Mesh(buildBoard(config.boxWidth, config.boxHeight, config.boardThickness, true), material);
    back.position.set(-config.boxWidth / 2, -config.boxHeight / 2, -config.boxDepth / 2);
    scene.add(back);

    const left = new THREE.Mesh(buildBoard(config.boxDepth, config.boxHeight, config.boardThickness, false), material);
    left.rotation.y = Math.PI / 2;
    left.position.set(-config.boxWidth / 2, -config.boxHeight / 2, -config.boxDepth / 2);
    scene.add(left);

    const right = new THREE.Mesh(buildBoard(config.boxDepth, config.boxHeight, config.boardThickness, false), material);
    right.rotation.y = Math.PI / 2;
    right.position.set(config.boxWidth / 2 - config.boardThickness, -config.boxHeight / 2, -config.boxDepth / 2);
    scene.add(right);

    const animate = () => {
      const animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      return animId;
    };
    const id = animate();

    return () => {
      cancelAnimationFrame(id);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [view, config]);

  if (view === '2D') {
    const scale = 50;
    return (
      <div className="flex-1 overflow-auto bg-[#0a0a0a] p-10 flex flex-col items-center gap-16">
        <div className="text-center">
          <h3 className="text-tool-cyan font-black text-xs uppercase tracking-widest mb-4">Board A: Front & Back (Pins)</h3>
          <svg width={config.boxWidth * scale + 40} height={config.boxHeight * scale + 40} className="border border-white/10">
            <rect x="20" y="20" width={config.boxWidth * scale} height={config.boxHeight * scale} fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-tool-cyan font-black text-xs uppercase tracking-widest mb-4">Board B: Sides (Tails)</h3>
          <svg width={config.boxDepth * scale + 40} height={config.boxHeight * scale + 40} className="border border-white/10">
            <rect x="20" y="20" width={config.boxDepth * scale} height={config.boxHeight * scale} fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 w-full h-full relative">
      {!config.isGenerated && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/60 backdrop-blur-md z-10">
          <div className="w-16 h-16 border-2 border-tool-cyan rounded-full flex items-center justify-center mb-6 animate-pulse">
            <i className="fa-solid fa-microchip text-tool-cyan text-2xl"></i>
          </div>
          <h2 className="text-xl font-black uppercase text-white tracking-[0.2em]">Engine Standby</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xs uppercase font-bold text-[10px] tracking-widest">Configure parameters and hit GENERATE for 3D construction.</p>
        </div>
      )}
    </div>
  );
};

export default Schematic;
