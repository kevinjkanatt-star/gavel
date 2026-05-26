import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Environment, ContactShadows, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import gsap from 'gsap';

function checkWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

/* ─────────────────────────────────────────────
   SOUND BLOCK (striking pad on the bench)
───────────────────────────────────────────── */
function SoundBlock() {
  return (
    <group position={[0.3, -4.63, 0.3]}>
      {/* Main block body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.32, 1.15]} />
        <meshStandardMaterial color="#1e0c04" roughness={0.38} metalness={0.12} envMapIntensity={1.0} />
      </mesh>
      {/* Top face slightly lighter */}
      <mesh position={[0, 0.162, 0]}>
        <boxGeometry args={[1.85, 0.06, 0.92]} />
        <meshStandardMaterial color="#3a1a0a" roughness={0.42} metalness={0.05} />
      </mesh>
      {/* Gold trim left/right */}
      {[-1.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0]}>
          <boxGeometry args={[0.06, 0.35, 1.16]} />
          <meshStandardMaterial color="#C9A84C" roughness={0.1} metalness={0.97} envMapIntensity={2.5} />
        </mesh>
      ))}
      {/* Gold trim front/back */}
      {[-0.575, 0.575].map((z, i) => (
        <mesh key={i} position={[0, 0.02, z]}>
          <boxGeometry args={[2.12, 0.35, 0.06]} />
          <meshStandardMaterial color="#b8963a" roughness={0.12} metalness={0.96} envMapIntensity={2.2} />
        </mesh>
      ))}
      {/* Recessed strike zone on top */}
      <mesh position={[0, 0.195, 0]}>
        <boxGeometry args={[1.2, 0.015, 0.7]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.22} metalness={0.88} envMapIntensity={1.8} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   JUDGE'S BENCH
───────────────────────────────────────────── */
function JudgeBench() {
  return (
    <group position={[0, -4.82, -1.2]}>
      <mesh receiveShadow>
        <boxGeometry args={[18, 0.34, 4.0]} />
        <meshStandardMaterial color="#140804" roughness={0.32} metalness={0.14} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[0, -0.175, 0]} receiveShadow>
        <boxGeometry args={[18, 0.07, 4.0]} />
        <meshStandardMaterial color="#0e0502" roughness={0.55} metalness={0.06} />
      </mesh>
      {/* Front fascia */}
      <mesh position={[0, -1.5, 1.9]} receiveShadow>
        <boxGeometry args={[18, 3.0, 0.26]} />
        <meshStandardMaterial color="#1a0a04" roughness={0.4} metalness={0.08} />
      </mesh>
      {/* Top gold rail */}
      <mesh position={[0, 0.22, 1.9]}>
        <boxGeometry args={[18, 0.07, 0.09]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.1} metalness={0.96} envMapIntensity={2.0} />
      </mesh>
      {/* Bottom gold rail */}
      <mesh position={[0, -2.97, 1.9]}>
        <boxGeometry args={[18, 0.07, 0.09]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.1} metalness={0.96} envMapIntensity={2.0} />
      </mesh>
      {/* Vertical gold pilasters on fascia */}
      {[-8, -5.5, -3, -0.5, 2, 4.5, 7].map((x, i) => (
        <mesh key={i} position={[x, -1.5, 1.95]}>
          <boxGeometry args={[0.07, 3.0, 0.07]} />
          <meshStandardMaterial color="#b8963a" roughness={0.14} metalness={0.94} envMapIntensity={1.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────
   CORINTHIAN PILLAR
───────────────────────────────────────────── */
function PillarWithFluting({ position, scale = 1 }) {
  const FLUTES = 16;
  const H = 10.0 * scale;
  return (
    <group position={position}>
      {/* Shaft */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.27 * scale, 0.34 * scale, H, 36]} />
        <meshStandardMaterial color="#ddd8cc" roughness={0.65} metalness={0.05} envMapIntensity={0.6} />
      </mesh>
      {/* Fluting channels */}
      {Array.from({ length: FLUTES }).map((_, i) => {
        const angle = (i / FLUTES) * Math.PI * 2;
        const r = 0.29 * scale;
        return (
          <mesh key={i} position={[Math.sin(angle) * r, 0.5, Math.cos(angle) * r]}
            rotation={[0, -angle, 0]} castShadow>
            <boxGeometry args={[0.032 * scale, H - 0.4, 0.018 * scale]} />
            <meshStandardMaterial color="#c4bdb0" roughness={0.75} metalness={0.02} />
          </mesh>
        );
      })}
      {/* Capital — echinus */}
      <group position={[0, H / 2 + 0.44, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.46 * scale, 0.29 * scale, 0.38 * scale, 36]} />
          <meshStandardMaterial color="#d0c9ba" roughness={0.62} metalness={0.04} />
        </mesh>
        {/* Abacus */}
        <mesh position={[0, 0.3 * scale, 0]}>
          <boxGeometry args={[0.98 * scale, 0.22 * scale, 0.98 * scale]} />
          <meshStandardMaterial color="#ccc5b6" roughness={0.60} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.42 * scale, 0]}>
          <boxGeometry args={[1.06 * scale, 0.12 * scale, 1.06 * scale]} />
          <meshStandardMaterial color="#c0b9aa" roughness={0.60} metalness={0.04} />
        </mesh>
      </group>
      {/* Base — torus + slab */}
      <group position={[0, -H / 2 + 0.1, 0]}>
        <mesh castShadow>
          <torusGeometry args={[0.36 * scale, 0.08 * scale, 16, 32]} />
          <meshStandardMaterial color="#d0c9ba" roughness={0.65} metalness={0.03} />
        </mesh>
        <mesh position={[0, -0.14 * scale, 0]}>
          <cylinderGeometry args={[0.48 * scale, 0.48 * scale, 0.22 * scale, 32]} />
          <meshStandardMaterial color="#ccc5b6" roughness={0.65} metalness={0.03} />
        </mesh>
        <mesh position={[0, -0.32 * scale, 0]}>
          <boxGeometry args={[1.1 * scale, 0.12 * scale, 1.1 * scale]} />
          <meshStandardMaterial color="#bfb8aa" roughness={0.65} metalness={0.03} />
        </mesh>
      </group>
    </group>
  );
}

function Pillars() {
  return (
    <>
      {[-6.5, 6.5, -10.5, 10.5].map((x, i) => (
        <PillarWithFluting key={i} position={[x, 0.2, -3.5]} />
      ))}
      {/* Entablature beam across top */}
      <mesh position={[0, 5.78, -3.5]}>
        <boxGeometry args={[24, 0.42, 0.38]} />
        <meshStandardMaterial color="#d4cec0" roughness={0.68} metalness={0.03} />
      </mesh>
      <mesh position={[0, 6.05, -3.5]}>
        <boxGeometry args={[24, 0.15, 0.52]} />
        <meshStandardMaterial color="#c8c2b4" roughness={0.7} metalness={0.03} />
      </mesh>
      {/* Dentil molding */}
      {Array.from({ length: 22 }).map((_, i) => (
        <mesh key={i} position={[-11 + i * 1.05, 5.68, -3.38]}>
          <boxGeometry args={[0.44, 0.22, 0.16]} />
          <meshStandardMaterial color="#d8d2c4" roughness={0.72} metalness={0.02} />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   SCALES OF JUSTICE — with chain links
───────────────────────────────────────────── */
function ChainLinks({ startY, endY, x, count = 10 }) {
  const step = (endY - startY) / (count - 1);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[x, startY + i * step, 0]}
          rotation={[i % 2 === 0 ? 0 : Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.026, 0.009, 10, 16]} />
          <meshStandardMaterial color="#C9A84C" roughness={0.1} metalness={0.97} envMapIntensity={2.8} />
        </mesh>
      ))}
    </>
  );
}

function ScalePan({ x, tilt = 0 }) {
  return (
    <group position={[x, 0, 0]} rotation={[0, 0, tilt]}>
      {/* Pan bowl rim */}
      <mesh position={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.36, 0.032, 20, 48]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.08} metalness={0.97} envMapIntensity={3.0} />
      </mesh>
      {/* Pan dish */}
      <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.22, 0.06, 40, 1, true]} />
        <meshStandardMaterial color="#b8963a" roughness={0.14} metalness={0.92} envMapIntensity={2.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Base disc */}
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.025, 32]} />
        <meshStandardMaterial color="#d4a840" roughness={0.12} metalness={0.94} envMapIntensity={2.2} />
      </mesh>
      {/* Three chains from rim up to arm */}
      {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => {
        const cx = Math.sin(angle) * 0.32;
        const cz = Math.cos(angle) * 0.32;
        return (
          <mesh key={i} position={[cx, 0.38, cz]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.007, 0.007, 0.78, 8]} />
            <meshStandardMaterial color="#C9A84C" roughness={0.1} metalness={0.95} envMapIntensity={2.5} />
          </mesh>
        );
      })}
    </group>
  );
}

function ScalesOfJustice() {
  return (
    <group position={[-3.2, -4.65, 0.5]}>
      {/* Marble base */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.22, 40]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.3} metalness={0.08} envMapIntensity={0.8} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 0.07, 40]} />
        <meshStandardMaterial color="#d4cec0" roughness={0.42} metalness={0.06} />
      </mesh>
      {/* Central column */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.046, 2.2, 20]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.12} metalness={0.96} envMapIntensity={2.5} />
      </mesh>
      {/* Decorative ring mid-column */}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.065, 0.018, 14, 28]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.1} metalness={0.97} envMapIntensity={2.8} />
      </mesh>
      {/* Top sphere finial */}
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.072, 28, 28]} />
        <meshStandardMaterial color="#e8c84c" roughness={0.08} metalness={0.98} envMapIntensity={3.2} />
      </mesh>
      {/* Flame topper */}
      <mesh position={[0, 2.42, 0]}>
        <coneGeometry args={[0.038, 0.22, 16]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.14} metalness={0.96} envMapIntensity={2.5} />
      </mesh>
      {/* Crossbeam arm — slightly tilted for realism */}
      <mesh position={[0, 2.1, 0]} rotation={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.018, 0.018, 2.2, 16]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.1} metalness={0.97} envMapIntensity={2.8} />
      </mesh>
      {/* Arm end connectors */}
      {[-1.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 2.1, 0]}>
          <sphereGeometry args={[0.038, 20, 20]} />
          <meshStandardMaterial color="#e8c84c" roughness={0.08} metalness={0.98} envMapIntensity={3.0} />
        </mesh>
      ))}
      {/* Chain links from arm down to pans */}
      <ChainLinks startY={1.7} endY={1.1} x={-1.0} count={8} />
      <ChainLinks startY={1.7} endY={1.1} x={1.0} count={8} />
      {/* Scale pans */}
      <group position={[0, 1.1, 0]}>
        <ScalePan x={-1.0} tilt={0.06} />
        <ScalePan x={1.0} tilt={-0.04} />
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   LAW BOOKS — thick, varied, realistic
───────────────────────────────────────────── */
function LawBook({ position, rotation, color, spine, h, w, d, title }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Book body */}
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.62} metalness={0.04} envMapIntensity={0.4} />
      </mesh>
      {/* Spine strip */}
      <mesh position={[-w / 2 + 0.012, 0, 0]}>
        <boxGeometry args={[0.025, h - 0.01, d + 0.006]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.14} metalness={0.9} envMapIntensity={1.8} />
      </mesh>
      {/* Pages edge (right side, off-white) */}
      <mesh position={[w / 2 - 0.018, 0, 0]}>
        <boxGeometry args={[0.036, h - 0.014, d - 0.014]} />
        <meshStandardMaterial color="#f2ede2" roughness={0.88} metalness={0.0} />
      </mesh>
      {/* Top/bottom gold bands */}
      {[-h / 2 + 0.018, h / 2 - 0.018].map((y, i) => (
        <mesh key={i} position={[-w / 2 + 0.02, y, 0]}>
          <boxGeometry args={[0.025, 0.022, d + 0.005]} />
          <meshStandardMaterial color="#d4a840" roughness={0.12} metalness={0.94} envMapIntensity={2.0} />
        </mesh>
      ))}
      {/* Gold title bar on spine */}
      <mesh position={[-w / 2 + 0.014, h * 0.22, 0]}>
        <boxGeometry args={[0.028, h * 0.28, d * 0.55]} />
        <meshStandardMaterial color="#b88c2e" roughness={0.18} metalness={0.88} envMapIntensity={1.5} />
      </mesh>
    </group>
  );
}

function LawBooks() {
  const BOOKS = [
    { h: 0.24, w: 0.94, d: 0.65, color: '#6B1624', ry: 0.04 },
    { h: 0.20, w: 0.90, d: 0.62, color: '#1a2838', ry: -0.05 },
    { h: 0.22, w: 0.92, d: 0.63, color: '#1a3a1a', ry: 0.07 },
    { h: 0.18, w: 0.88, d: 0.61, color: '#2d1008', ry: -0.03 },
    { h: 0.21, w: 0.91, d: 0.63, color: '#2a2060', ry: 0.05 },
    { h: 0.17, w: 0.87, d: 0.60, color: '#1a2010', ry: -0.06 },
  ];
  let cumY = 0;
  return (
    <group position={[3.4, -4.65, 0.4]}>
      {BOOKS.map((b, i) => {
        const yPos = cumY + b.h / 2;
        cumY += b.h;
        return (
          <LawBook
            key={i}
            position={[i * 0.03 - 0.07, yPos, 0]}
            rotation={[0, b.ry, 0]}
            color={b.color}
            h={b.h} w={b.w} d={b.d}
          />
        );
      })}
      {/* Bookend — left */}
      <mesh position={[-0.65, 0.25, 0]}>
        <boxGeometry args={[0.055, 0.52, 0.62]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.12} metalness={0.96} envMapIntensity={2.2} />
      </mesh>
      <mesh position={[-0.65, 0.0, 0.32]}>
        <boxGeometry args={[0.055, 0.06, 0.62]} />
        <meshStandardMaterial color="#b8963a" roughness={0.14} metalness={0.94} envMapIntensity={2.0} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   GAVEL — detailed, realistic
───────────────────────────────────────────── */
function Gavel({ gavelRef, onStrike }) {
  return (
    <Float speed={0.9} rotationIntensity={0.05} floatIntensity={0.22}>
      <group ref={gavelRef} position={[0.3, -0.5, 1.6]} rotation={[0.15, -0.25, -0.72]}
        scale={1.55} onClick={onStrike} style={{ cursor: 'pointer' }}>

        {/* ── Handle ── */}
        {/* Main shaft tapered */}
        <mesh position={[0, -2.2, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.22, 4.8, 44]} />
          <meshStandardMaterial color="#4a2208" roughness={0.44} metalness={0.05} envMapIntensity={0.5} />
        </mesh>
        {/* Handle end cap — rounded */}
        <mesh position={[0, -4.64, 0]} castShadow>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="#3a1a06" roughness={0.46} metalness={0.05} />
        </mesh>
        {/* Wood grain ring near end */}
        <mesh position={[0, -4.05, 0]}>
          <torusGeometry args={[0.19, 0.016, 14, 36]} />
          <meshStandardMaterial color="#6a3210" roughness={0.38} metalness={0.06} />
        </mesh>
        {/* Grip wrapping — dark leather rings */}
        {[-1.4, -1.1, -0.8, -0.5].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.155 - i * 0.008, 0.013, 12, 32]} />
            <meshStandardMaterial color="#180904" roughness={0.72} metalness={0.04} />
          </mesh>
        ))}

        {/* ── Head collar / neck ── */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.26, 0.27, 0.52, 40]} />
          <meshStandardMaterial color="#C9A84C" roughness={0.1} metalness={0.97} envMapIntensity={2.8} />
        </mesh>

        {/* ── Hammer head ── */}
        {/* Main barrel */}
        <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.60, 0.60, 3.1, 64]} />
          <meshStandardMaterial color="#1e0a04" roughness={0.28} metalness={0.35} envMapIntensity={2.2} />
        </mesh>
        {/* Bevel caps — left */}
        <mesh position={[-1.55, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.54, 0.60, 0.16, 64]} />
          <meshStandardMaterial color="#160804" roughness={0.3} metalness={0.28} envMapIntensity={1.8} />
        </mesh>
        <mesh position={[-1.7, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.40, 0.54, 0.12, 64]} />
          <meshStandardMaterial color="#0e0502" roughness={0.32} metalness={0.26} envMapIntensity={1.6} />
        </mesh>
        {/* Bevel caps — right */}
        <mesh position={[1.55, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.54, 0.60, 0.16, 64]} />
          <meshStandardMaterial color="#160804" roughness={0.3} metalness={0.28} envMapIntensity={1.8} />
        </mesh>
        <mesh position={[1.7, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.40, 0.54, 0.12, 64]} />
          <meshStandardMaterial color="#0e0502" roughness={0.32} metalness={0.26} envMapIntensity={1.6} />
        </mesh>

        {/* Gold accent rings on head */}
        {[-1.48, -0.85, -0.25, 0.25, 0.85, 1.48].map((x, i) => (
          <mesh key={i} position={[x, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.614, 0.614, i % 3 === 0 ? 0.09 : 0.055, 64]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#C9A84C" : "#b8963a"}
              roughness={0.08} metalness={0.98} envMapIntensity={3.0} />
          </mesh>
        ))}

        {/* Center decorative band — wider */}
        <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.62, 0.62, 0.22, 64]} />
          <meshStandardMaterial color="#d4a840" roughness={0.07} metalness={0.99} envMapIntensity={3.5} />
        </mesh>

        {/* Strike face texture (flat circles on both ends) */}
        {[-1.56, 1.56].map((x, i) => (
          <mesh key={i} position={[x, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
            <circleGeometry args={[0.38, 40]} />
            <meshStandardMaterial color="#0a0402" roughness={0.18} metalness={0.55} envMapIntensity={1.5} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────────────
   FULL SCENE
───────────────────────────────────────────── */
function GavelScene({ onStrikeComplete }) {
  const gavelRef = useRef(null);
  const rippleRef = useRef(null);
  const sceneRef = useRef(null);
  const [isStriking, setIsStriking] = useState(false);

  useFrame(({ mouse }) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y = THREE.MathUtils.lerp(sceneRef.current.rotation.y, (mouse.x * Math.PI) / 20, 0.04);
      sceneRef.current.rotation.x = THREE.MathUtils.lerp(sceneRef.current.rotation.x, (-mouse.y * Math.PI) / 38, 0.04);
    }
    if (gavelRef.current && !isStriking) {
      gavelRef.current.rotation.y += 0.0015;
    }
  });

  const handleStrike = () => {
    if (isStriking || !gavelRef.current || !rippleRef.current) return;
    setIsStriking(true);
    const gavel = gavelRef.current;
    const ripple = rippleRef.current;

    const tl = gsap.timeline({ onComplete: () => { setIsStriking(false); onStrikeComplete(); } });
    tl.to(gavel.rotation, { z: -1.2, x: -0.1, duration: 0.16, ease: 'power2.in' });
    tl.to(gavel.rotation, { z: 0.2, x: 0.72, duration: 0.2, ease: 'power4.in' });
    tl.to(gavel.position, { y: -1.15, duration: 0.2, ease: 'power4.in' }, '<');

    tl.add(() => {
      ripple.scale.set(0.05, 0.05, 0.05);
      ripple.material.opacity = 0.9;
      gsap.to(ripple.scale, { x: 11, y: 11, z: 11, duration: 1.4, ease: 'power2.out' });
      gsap.to(ripple.material, { opacity: 0, duration: 1.4, ease: 'power2.out' });
      document.body.style.transform = 'translate(5px,5px)';
      setTimeout(() => { document.body.style.transform = 'translate(-5px,-3px)'; }, 55);
      setTimeout(() => { document.body.style.transform = 'translate(4px,-4px)'; }, 115);
      setTimeout(() => { document.body.style.transform = 'translate(0,0)'; }, 175);
    }, '-=0.02');

    tl.to(gavel.rotation, { z: -0.72, x: 0.15, duration: 1.3, ease: 'elastic.out(1,0.34)' }, '+=0.06');
    tl.to(gavel.position, { y: -0.5, duration: 1.0, ease: 'elastic.out(1,0.42)' }, '<');
  };

  window.triggerGavelStrike = handleStrike;

  return (
    <group ref={sceneRef}>
      {/* Lighting */}
      <ambientLight intensity={0.45} color="#fff8f0" />
      {/* Key light */}
      <directionalLight position={[5, 16, 8]} intensity={3.2} color="#fff5e8" castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={0.5} shadow-camera-far={50}
        shadow-camera-left={-14} shadow-camera-right={14}
        shadow-camera-top={14} shadow-camera-bottom={-14}
        shadow-bias={-0.0004} />
      {/* Burgundy fill from left */}
      <spotLight position={[-12, 10, 6]} intensity={4.0} color="#7C1D2B"
        angle={0.38} penumbra={0.8} castShadow />
      {/* Gold rim light on gavel */}
      <pointLight position={[1.5, 2, 4]} intensity={2.4} color="#C9A84C" distance={18} />
      {/* Warm backfill */}
      <pointLight position={[-3, -1, 4]} intensity={0.9} color="#7C1D2B" distance={20} />
      {/* Cool top for pillars */}
      <pointLight position={[0, 9, -2]} intensity={1.0} color="#e8e0d8" distance={30} />
      {/* Under-glow */}
      <pointLight position={[0.3, -3.5, 2]} intensity={0.6} color="#C9A84C" distance={12} />

      <Environment preset="city" />

      <Pillars />
      <JudgeBench />
      <SoundBlock />
      <ScalesOfJustice />
      <LawBooks />

      <Gavel gavelRef={gavelRef} onStrike={handleStrike} />

      {/* Strike ripple */}
      <mesh ref={rippleRef} position={[0.3, -4.52, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 1.1, 72]} />
        <meshBasicMaterial color="#C9A84C" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      <Sparkles count={180} scale={20} size={1.4} speed={0.22} color="#C9A84C" opacity={0.45} />
      <ContactShadows position={[0, -5.15, 0]} opacity={0.65} scale={30} blur={3.5} far={7} color="#2a1206" />
    </group>
  );
}

function StaticHeroBackground() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #C9A84C 0%, #7C1D2B 50%, transparent 100%)', filter: 'blur(80px)' }} />
    </div>
  );
}

export default function HeroSection() {
  const [isStruck, setIsStruck] = useState(false);

  const slowScrollToFeatures = () => {
    const target = document.getElementById('features');
    if (!target) return;
    const startY = window.scrollY;
    const endY = target.getBoundingClientRect().top + window.scrollY;
    const dur = 2800;
    let start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      window.scrollTo(0, startY + (endY - startY) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const handleStrikeComplete = () => {
    setIsStruck(true);
    setTimeout(slowScrollToFeatures, 900);
  };

  const triggerStrike = () => {
    if (window.triggerGavelStrike) window.triggerGavelStrike();
    else handleStrikeComplete();
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
    visible: (i) => ({ opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: i * 0.11, duration: 0.85, ease: 'easeOut' } }),
    dust: { opacity: 0, y: -45, filter: 'blur(22px)', scale: 1.04, transition: { duration: 1.3, ease: 'easeIn' } },
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background z-[1] pointer-events-none" />

      <motion.div className="absolute inset-0 z-0"
        animate={isStruck ? { opacity: 0, transition: { duration: 1.4, ease: 'easeIn' } } : { opacity: 1 }}>
        {checkWebGL() ? (
          <Canvas camera={{ position: [0, 1.5, 13], fov: 42 }} shadows gl={{ antialias: true, alpha: true }}>
            <GavelScene onStrikeComplete={handleStrikeComplete} />
          </Canvas>
        ) : (
          <StaticHeroBackground />
        )}
      </motion.div>

      <motion.div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        animate={isStruck ? 'dust' : 'visible'}>
        <div className="max-w-4xl mx-auto mt-16">
          <motion.h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            {'Justice Powered by Intelligence'.split(' ').map((word, i) => (
              <motion.span key={i} custom={i} variants={wordVariants} initial="hidden" animate={isStruck ? 'dust' : 'visible'}
                className="inline-block mr-3 md:mr-4" style={{ textShadow: '0 2px 20px rgba(255,255,255,0.6)' }}>
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p className="text-xl md:text-2xl text-foreground/75 font-light mb-12"
            variants={wordVariants} custom={5} initial="hidden" animate={isStruck ? 'dust' : 'visible'}>
            Gavel &amp; Brief — The Future of Legal Technology
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-6 pointer-events-auto"
            variants={wordVariants} custom={6} initial="hidden" animate={isStruck ? 'dust' : 'visible'}>
            <button onClick={triggerStrike}
              className="bg-primary text-primary-foreground px-9 py-4 rounded-sm font-semibold text-lg transition-all duration-500 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 relative overflow-hidden group w-full sm:w-auto">
              <span className="relative z-10">Begin Experience</span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </button>
            <button className="border border-foreground/20 text-foreground px-9 py-4 rounded-sm font-semibold text-lg transition-all duration-300 hover:bg-foreground/5 w-full sm:w-auto backdrop-blur-sm"
              onClick={() => { const s = document.getElementById('features'); if (s) s.scrollIntoView({ behavior: 'smooth' }); }}>
              Learn More
            </button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
