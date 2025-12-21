
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { JointConfig } from '../types.ts';
import { WOOD_PROFILES } from '../constants.ts';

interface ShowroomProps {
  config: JointConfig;
  onBack: () => void;
  onFinalize: () => void;
}

const Showroom: React.FC<ShowroomProps> = ({ config, onBack, onFinalize }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [explode, setExplode] = useState(0);
  const meshesRef = useRef<{
    front?: THREE.Mesh;
    back?: THREE.Mesh;
    left?: THREE.Mesh;
    right?: THREE.Mesh;
  }>({});

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
        } else {
          shape.lineTo(w, nextY);
        }
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
        } else {
          shape.lineTo(w, nextY);
        }
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
        } else {
          shape.lineTo(0, nextY);
        }
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
        } else {
          shape.lineTo(0, nextY);
        }
      }
      curY = nextY;
    });

    return new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(20, 15, 20);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const frontBackMat = new THREE.MeshStandardMaterial({ color: '#D4A373', roughness: 0.7 });
    const sidesMat = new THREE.MeshStandardMaterial({ color: '#A98467', roughness: 0.8 });
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
      const id = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      return id;
    };
    const animId = animate();
    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [config]);

  useEffect(() => {
    const { front, back, left, right } = meshesRef.current;
    const factor = explode * 5;
    if (front) front.position.set(-config.boxWidth / 2, -config.boxHeight / 2, (config.boxDepth / 2 - config.boardThickness) + factor);
    if (back) back.position.set(config.boxWidth / 2, -config.boxHeight / 2, (-config.boxDepth / 2 + config.boardThickness) - factor);
    if (left) left.position.set(-config.boxWidth / 2 + config.boardThickness - factor, -config.boxHeight / 2, -config.boxDepth / 2);
    if (right) right.position.set(config.boxWidth / 2 - config.boardThickness + factor, -config.boxHeight / 2, config.boxDepth / 2);
  }, [explode, config]);

  return (
    <div className="h-full flex flex-col relative bg-white">
      <div ref={containerRef} className="flex-1 w-full" />
      <div className="absolute top-8 left-8 z-10 pointer-events-none select-none">
        <h2 className="text-4xl font-black uppercase tracking-tight text-black">The Showroom</h2>
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">3D Structural Verification Model</p>
      </div>
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 w-[300px] bg-white thick-border p-6 shadow-[8px_8px_0_0_#000]">
        <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase tracking-widest">
          <span>Assembly View</span>
          <span className="font-mono">{(explode * 100).toFixed(0)}%</span>
        </div>
        <input 
          type="range" min="0" max="1" step="0.01" value={explode} 
          onChange={(e) => setExplode(parseFloat(e.target.value))}
          className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="absolute bottom-8 right-8 z-10 flex gap-4">
        <button onClick={onBack} className="btn-secondary bg-white">← Back</button>
        <button className="btn-primary" onClick={onFinalize}>
          Finalize & Build Project <i className="fa-solid fa-hammer"></i>
        </button>
      </div>
    </div>
  );
};

export default Showroom;
