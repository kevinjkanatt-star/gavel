import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Environment, ContactShadows, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import gsap from 'gsap';

function checkWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

/* ── shared PBR helpers ── */
const GOLD = { color: '#C9A84C', roughness: 0.06, metalness: 1.0, envMapIntensity: 3.5, emissive: '#C9A84C', emissiveIntensity: 0.04 };
const DARK_GOLD = { color: '#a87830', roughness: 0.1, metalness: 0.98, envMapIntensity: 2.8, emissive: '#b8922e', emissiveIntensity: 0.02 };
const MARBLE = { color: '#ede8e0', roughness: 0.06, metalness: 0.0 };
const DARK_WOOD = { color: '#1c0a03', roughness: 0.28, metalness: 0.0 };
const MED_WOOD = { color: '#4a1e06', roughness: 0.42, metalness: 0.0 };

/* ─────────────────────────────────────────────
   MARBLE FLOOR
───────────────────────────────────────────── */
function MarbleFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.15, 0]} receiveShadow>
      <planeGeometry args={[50, 28]} />
      <meshPhysicalMaterial
        color="#ddd8d0"
        roughness={0.04}
        metalness={0.0}
        clearcoat={1.0}
        clearcoatRoughness={0.06}
        reflectivity={0.9}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   MARBLE BACK WALL
───────────────────────────────────────────── */
function BackWall() {
  return (
    <>
      <mesh position={[0, 1.5, -7]} receiveShadow>
        <planeGeometry args={[50, 28]} />
        <meshPhysicalMaterial
          color="#cec8be"
          roughness={0.55}
          metalness={0.0}
          clearcoat={0.3}
          clearcoatRoughness={0.3}
          envMapIntensity={0.4}
        />
      </mesh>
      {/* Wainscoting panel rail */}
      <mesh position={[0, -3.2, -6.88]}>
        <boxGeometry args={[50, 0.09, 0.06]} />
        <meshPhysicalMaterial {...GOLD} />
      </mesh>
    </>
  );
}

/* ─────────────────────────────────────────────
   CANDLE SCONCES
───────────────────────────────────────────── */
function Candle({ position }) {
  const flameRef = useRef();
  useFrame(({ clock }) => {
    if (flameRef.current) {
      const t = clock.getElapsedTime();
      flameRef.current.scale.x = 1 + Math.sin(t * 7.3 + position[0]) * 0.08;
      flameRef.current.scale.z = 1 + Math.cos(t * 9.1 + position[0]) * 0.08;
      flameRef.current.position.y = 0.18 + Math.sin(t * 6 + position[0]) * 0.012;
    }
  });
  return (
    <group position={position}>
      {/* Candle body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.06, 0.55, 20]} />
        <meshPhysicalMaterial color="#f5f0e4" roughness={0.85} metalness={0.0} clearcoat={0.1} />
      </mesh>
      {/* Wick */}
      <mesh position={[0, 0.29, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.06, 6]} />
        <meshStandardMaterial color="#1a0e00" roughness={1.0} metalness={0.0} />
      </mesh>
      {/* Flame */}
      <group ref={flameRef} position={[0, 0.18, 0]}>
        <mesh>
          <coneGeometry args={[0.028, 0.1, 12]} />
          <meshStandardMaterial color="#ff9900" emissive="#ff6600" emissiveIntensity={2.5}
            transparent opacity={0.92} roughness={0.0} metalness={0.0} />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshStandardMaterial color="#ffdd44" emissive="#ffaa00" emissiveIntensity={3.0}
            transparent opacity={0.88} roughness={0.0} metalness={0.0} />
        </mesh>
      </group>
      {/* Wax drip */}
      <mesh position={[0.028, 0.18, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshPhysicalMaterial color="#f0ebe0" roughness={0.7} metalness={0.0} />
      </mesh>
      {/* Brass holder */}
      <mesh position={[0, -0.29, 0]}>
        <cylinderGeometry args={[0.09, 0.07, 0.04, 20]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={0.6} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, -0.31, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.018, 20]} />
        <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.5} />
      </mesh>
      {/* Point light from flame */}
      <pointLight position={[0, 0.2, 0]} intensity={1.4} color="#ff8800" distance={7} decay={2} />
    </group>
  );
}

function Candles() {
  return (
    <>
      <Candle position={[-4.2, -4.32, 1.1]} />
      <Candle position={[5.0, -4.32, 1.1]} />
      <Candle position={[-2.0, -4.32, 1.0]} />
    </>
  );
}

/* ─────────────────────────────────────────────
   SOUND BLOCK
───────────────────────────────────────────── */
function SoundBlock() {
  return (
    <group position={[0.3, -4.63, 0.3]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.32, 1.15]} />
        <meshPhysicalMaterial color="#100602" roughness={0.25} metalness={0.08}
          clearcoat={0.9} clearcoatRoughness={0.04} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[0, 0.162, 0]}>
        <boxGeometry args={[1.85, 0.06, 0.9]} />
        <meshPhysicalMaterial color="#2a1208" roughness={0.3} metalness={0.05}
          clearcoat={0.7} clearcoatRoughness={0.06} />
      </mesh>
      {[-1.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0]}>
          <boxGeometry args={[0.06, 0.35, 1.16]} />
          <meshPhysicalMaterial {...GOLD} clearcoat={0.7} clearcoatRoughness={0.08} />
        </mesh>
      ))}
      {[-0.575, 0.575].map((z, i) => (
        <mesh key={i} position={[0, 0.02, z]}>
          <boxGeometry args={[2.12, 0.35, 0.06]} />
          <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.195, 0]}>
        <boxGeometry args={[1.0, 0.012, 0.58]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.04} emissiveIntensity={0.08} />
      </mesh>
      {/* Inset decorative oval */}
      {[-0.55, 0, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.012, 10, 28]} />
          <meshPhysicalMaterial {...GOLD} clearcoat={0.8} />
        </mesh>
      ))}
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
        <meshPhysicalMaterial color="#0e0602" roughness={0.22} metalness={0.0}
          clearcoat={1.0} clearcoatRoughness={0.03} envMapIntensity={1.0} />
      </mesh>
      <mesh position={[0, -0.175, 0]} receiveShadow>
        <boxGeometry args={[18, 0.07, 4.0]} />
        <meshPhysicalMaterial color="#080402" roughness={0.4} metalness={0.0} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, -1.5, 1.9]} receiveShadow>
        <boxGeometry args={[18, 3.0, 0.28]} />
        <meshPhysicalMaterial color="#100804" roughness={0.32} metalness={0.0}
          clearcoat={0.8} clearcoatRoughness={0.04} />
      </mesh>
      {/* Gold top rail */}
      <mesh position={[0, 0.22, 1.9]}>
        <boxGeometry args={[18, 0.07, 0.1]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={0.8} clearcoatRoughness={0.06} />
      </mesh>
      {/* Gold bottom rail */}
      <mesh position={[0, -2.97, 1.9]}>
        <boxGeometry args={[18, 0.07, 0.1]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={0.8} clearcoatRoughness={0.06} />
      </mesh>
      {/* Vertical pilasters */}
      {[-8.5, -6.0, -3.5, -1.0, 1.5, 4.0, 6.5].map((x, i) => (
        <mesh key={i} position={[x, -1.5, 1.96]}>
          <boxGeometry args={[0.07, 3.0, 0.07]} />
          <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────
   CORINTHIAN PILLAR — full detail
───────────────────────────────────────────── */
function PillarWithFluting({ position, scale = 1 }) {
  const FLUTES = 24;
  const H = 10.2 * scale;
  const S = scale;

  /* shared stone material */
  const stone = (lightness = 0) => ({
    roughness: 0.48 + lightness * 0.08,
    metalness: 0.0,
    clearcoat: 0.35 - lightness * 0.05,
    clearcoatRoughness: 0.22,
    envMapIntensity: 0.55,
  });

  return (
    <group position={position}>

      {/* ── SHAFT with entasis (slight belly) via tapered cylinders ── */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24 * S, 0.32 * S, H * 0.5, 52]} />
        <meshPhysicalMaterial color="#e2ddd5" {...stone()} />
      </mesh>
      <mesh position={[0, 0.5 + H * 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.23 * S, 0.24 * S, H * 0.5, 52]} />
        <meshPhysicalMaterial color="#e2ddd5" {...stone()} />
      </mesh>

      {/* ── FLUTING — semicircular channels for authentic light-play ── */}
      {Array.from({ length: FLUTES }).map((_, i) => {
        const angle = (i / FLUTES) * Math.PI * 2;
        const r = 0.255 * S;
        return (
          <mesh key={i}
            position={[Math.sin(angle) * r, 0.5, Math.cos(angle) * r]}
            rotation={[0, -angle + Math.PI / 2, 0]} castShadow>
            <cylinderGeometry args={[0.018 * S, 0.018 * S, H - 0.6, 8, 1, false, 0, Math.PI]} />
            <meshPhysicalMaterial color="#c6c0b0" roughness={0.65} metalness={0.0} clearcoat={0.15} />
          </mesh>
        );
      })}

      {/* ── CORINTHIAN CAPITAL ── */}
      <group position={[0, H / 2 + 0.55, 0]}>
        {/* Kalathos (bell-shaped core) */}
        <mesh castShadow>
          <cylinderGeometry args={[0.52 * S, 0.26 * S, 0.72 * S, 44]} />
          <meshPhysicalMaterial color="#d6d0c2" {...stone(0.1)} />
        </mesh>

        {/* Lower acanthus leaf tier — 8 leaves */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <group key={i} position={[Math.sin(a) * 0.38 * S, -0.18 * S, Math.cos(a) * 0.38 * S]}
              rotation={[-0.55, a + Math.PI, 0]}>
              <mesh castShadow>
                <coneGeometry args={[0.085 * S, 0.38 * S, 7]} />
                <meshPhysicalMaterial color="#cdc7b6" roughness={0.52} metalness={0.0} clearcoat={0.2} />
              </mesh>
              {/* leaf tip curl */}
              <mesh position={[0, 0.22 * S, 0.04 * S]} rotation={[0.6, 0, 0]}>
                <torusGeometry args={[0.032 * S, 0.012 * S, 8, 14, Math.PI]} />
                <meshPhysicalMaterial color="#c4beae" roughness={0.55} metalness={0.0} />
              </mesh>
            </group>
          );
        })}

        {/* Upper acanthus leaf tier — 8 smaller leaves */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return (
            <group key={i} position={[Math.sin(a) * 0.44 * S, 0.08 * S, Math.cos(a) * 0.44 * S]}
              rotation={[-0.38, a + Math.PI, 0]}>
              <mesh castShadow>
                <coneGeometry args={[0.065 * S, 0.28 * S, 7]} />
                <meshPhysicalMaterial color="#d0cabb" roughness={0.5} metalness={0.0} clearcoat={0.22} />
              </mesh>
            </group>
          );
        })}

        {/* Volute scrolls — 4 corners */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, i) => (
          <group key={i} position={[Math.sin(a) * 0.46 * S, 0.28 * S, Math.cos(a) * 0.46 * S]}
            rotation={[0, a, 0]}>
            <mesh>
              <torusGeometry args={[0.075 * S, 0.022 * S, 12, 24, Math.PI * 1.5]} />
              <meshPhysicalMaterial color="#c8c2b2" roughness={0.5} metalness={0.0} clearcoat={0.3} />
            </mesh>
            {/* Gold volute centre eye */}
            <mesh position={[0.075 * S, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014 * S, 0.014 * S, 0.012 * S, 12]} />
              <meshPhysicalMaterial {...GOLD} clearcoat={0.9} />
            </mesh>
          </group>
        ))}

        {/* Abacus (flat top slab) — 3 layers */}
        <mesh position={[0, 0.52 * S, 0]} castShadow>
          <boxGeometry args={[1.12 * S, 0.13 * S, 1.12 * S]} />
          <meshPhysicalMaterial color="#d0c9ba" {...stone(0.15)} />
        </mesh>
        <mesh position={[0, 0.62 * S, 0]}>
          <boxGeometry args={[1.18 * S, 0.07 * S, 1.18 * S]} />
          <meshPhysicalMaterial color="#c8c2b2" {...stone(0.2)} />
        </mesh>
        {/* Gold accent line on abacus edge */}
        <mesh position={[0, 0.66 * S, 0]}>
          <boxGeometry args={[1.2 * S, 0.018 * S, 1.2 * S]} />
          <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.7} />
        </mesh>
      </group>

      {/* ── BASE — Attic base with torus moldings ── */}
      <group position={[0, -H / 2 + 0.05, 0]}>
        {/* Upper torus (scotiae) */}
        <mesh castShadow>
          <torusGeometry args={[0.34 * S, 0.075 * S, 20, 40]} />
          <meshPhysicalMaterial color="#d2ccc0" {...stone(0.05)} />
        </mesh>
        {/* Dado cylinder */}
        <mesh position={[0, -0.16 * S, 0]}>
          <cylinderGeometry args={[0.48 * S, 0.48 * S, 0.22 * S, 40]} />
          <meshPhysicalMaterial color="#cac4b6" {...stone(0.1)} />
        </mesh>
        {/* Lower torus */}
        <mesh position={[0, -0.28 * S, 0]}>
          <torusGeometry args={[0.42 * S, 0.055 * S, 16, 36]} />
          <meshPhysicalMaterial color="#c8c2b4" {...stone(0.12)} />
        </mesh>
        {/* Plinth (square base) */}
        <mesh position={[0, -0.44 * S, 0]} castShadow>
          <boxGeometry args={[1.1 * S, 0.2 * S, 1.1 * S]} />
          <meshPhysicalMaterial color="#bdb7a8" {...stone(0.2)} />
        </mesh>
        {/* Gold plinth trim */}
        <mesh position={[0, -0.35 * S, 0]}>
          <boxGeometry args={[1.12 * S, 0.018 * S, 1.12 * S]} />
          <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.6} />
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
      {/* Main entablature */}
      <mesh position={[0, 5.82, -3.5]}>
        <boxGeometry args={[26, 0.44, 0.42]} />
        <meshPhysicalMaterial color="#d8d2c4" roughness={0.6} metalness={0.0} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 6.1, -3.5]}>
        <boxGeometry args={[26, 0.16, 0.56]} />
        <meshPhysicalMaterial color="#ccc6b8" roughness={0.62} metalness={0.0} clearcoat={0.25} />
      </mesh>
      {/* Dentil molding */}
      {Array.from({ length: 26 }).map((_, i) => (
        <mesh key={i} position={[-12.5 + i * 1.0, 5.7, -3.38]}>
          <boxGeometry args={[0.46, 0.2, 0.18]} />
          <meshPhysicalMaterial color="#dcd6c8" roughness={0.65} metalness={0.0} clearcoat={0.2} />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   SCALES OF JUSTICE — heavy, detailed
───────────────────────────────────────────── */
function ChainAssembly({ x, topY, panY, count = 14 }) {
  const step = (panY - topY) / (count - 1);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[x, topY + i * step, 0]}
          rotation={[i % 2 === 0 ? 0 : Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.024, 0.0082, 10, 18]} />
          <meshPhysicalMaterial {...GOLD} clearcoat={0.8} clearcoatRoughness={0.06} />
        </mesh>
      ))}
    </>
  );
}

function ScalePan({ x }) {
  /* Concave bowl using stacked shrinking discs */
  const BOWL_LAYERS = 7;
  return (
    <group position={[x, 0, 0]}>
      {/* Outer heavy rim ring */}
      <mesh castShadow>
        <torusGeometry args={[0.40, 0.042, 28, 64]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.03}
          anisotropy={0.8} anisotropyRotation={0} />
      </mesh>
      {/* Rim bevel inner edge */}
      <mesh>
        <torusGeometry args={[0.36, 0.018, 16, 56]} />
        <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.8} clearcoatRoughness={0.05} />
      </mesh>

      {/* Deep concave bowl — layers of shrinking, descending discs */}
      {Array.from({ length: BOWL_LAYERS }).map((_, i) => {
        const t = i / (BOWL_LAYERS - 1);
        const r = 0.38 * (1 - t * 0.72);
        const y = -0.015 - t * t * 0.14;
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.028, r, 48]} />
            <meshPhysicalMaterial
              color={i === 0 ? '#b8920e' : '#C9A84C'}
              roughness={0.06 + i * 0.04}
              metalness={1.0}
              envMapIntensity={3.5 - i * 0.3}
              emissive="#C9A84C"
              emissiveIntensity={0.03}
              clearcoat={1.0}
              clearcoatRoughness={0.03}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Bowl floor disc */}
      <mesh position={[0, -0.155, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.095, 36]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.02}
          emissive="#C9A84C" emissiveIntensity={0.05} />
      </mesh>

      {/* Three suspension chains — with connector rings */}
      {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => {
        const px = Math.sin(angle) * 0.35;
        const pz = Math.cos(angle) * 0.35;
        return (
          <group key={i}>
            {/* Attachment ring on rim */}
            <mesh position={[px * 0.95, 0.02, pz * 0.95]} rotation={[Math.PI / 2, angle, 0]}>
              <torusGeometry args={[0.022, 0.008, 10, 18]} />
              <meshPhysicalMaterial {...GOLD} clearcoat={0.9} />
            </mesh>
            {/* Chain rod */}
            <mesh position={[px * 0.88, 0.5, pz * 0.88]}
              rotation={[Math.atan2(0.5, 0.04), angle, 0]}>
              <cylinderGeometry args={[0.007, 0.007, 1.0, 8]} />
              <meshPhysicalMaterial {...GOLD} clearcoat={0.8} />
            </mesh>
            {/* Top connector knob */}
            <mesh position={[px * 0.3, 0.92, pz * 0.3]}>
              <sphereGeometry args={[0.022, 14, 14]} />
              <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.02} />
            </mesh>
          </group>
        );
      })}

      {/* Central gathering ring where chains meet */}
      <mesh position={[0, 0.98, 0]}>
        <torusGeometry args={[0.052, 0.016, 14, 28]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.02} />
      </mesh>
    </group>
  );
}

function ScalesOfJustice() {
  return (
    <group position={[-3.2, -4.65, 0.55]}>
      {/* Stepped marble plinth */}
      {[
        [0, 0.04, [0.62, 0.08, 0.62]],
        [0, -0.04, [0.76, 0.1, 0.76]],
        [0, -0.15, [0.88, 0.14, 0.88]],
      ].map(([x, y, size], i) => (
        <mesh key={i} position={[x, y, 0]} castShadow>
          <boxGeometry args={size} />
          <meshPhysicalMaterial color="#eae4da" roughness={0.12} metalness={0.0}
            clearcoat={0.9} clearcoatRoughness={0.04} envMapIntensity={0.8} />
        </mesh>
      ))}
      {/* Column */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.044, 2.18, 22]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={0.9} clearcoatRoughness={0.06} />
      </mesh>
      {/* Decorative rings on column */}
      {[0.32, 0.78, 1.42, 1.88].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.058, 0.014, 14, 28]} />
          <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.04} />
        </mesh>
      ))}
      {/* Top finial sphere */}
      <mesh position={[0, 2.28, 0]}>
        <sphereGeometry args={[0.075, 32, 32]} />
        <meshPhysicalMaterial color="#e8d050" roughness={0.04} metalness={1.0}
          envMapIntensity={4.0} emissive="#d4a020" emissiveIntensity={0.08}
          clearcoat={1.0} clearcoatRoughness={0.02} />
      </mesh>
      {/* Flame */}
      <mesh position={[0, 2.46, 0]}>
        <coneGeometry args={[0.036, 0.2, 16]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={0.8} />
      </mesh>
      {/* Cross-beam — very slight tilt */}
      <mesh position={[0, 2.12, 0]} rotation={[0, 0, 0.055]}>
        <cylinderGeometry args={[0.016, 0.016, 2.28, 18]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={0.9} clearcoatRoughness={0.05}
          anisotropy={0.8} anisotropyRotation={Math.PI / 2} />
      </mesh>
      {/* Arm end knobs */}
      {[-1.05, 1.05].map((x, i) => (
        <mesh key={i} position={[x, 2.12, 0]}>
          <sphereGeometry args={[0.036, 22, 22]} />
          <meshPhysicalMaterial color="#e8d050" roughness={0.04} metalness={1.0}
            envMapIntensity={4.5} clearcoat={1.0} clearcoatRoughness={0.02} />
        </mesh>
      ))}
      {/* Chains */}
      <ChainAssembly x={-1.05} topY={1.72} panY={1.14} count={12} />
      <ChainAssembly x={1.05} topY={1.72} panY={1.14} count={12} />
      {/* Pans */}
      <group position={[0, 1.14, 0]}>
        <ScalePan x={-1.05} />
        <ScalePan x={1.05} />
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   LAW BOOKS — premium leather volumes
───────────────────────────────────────────── */
function LawBook({ position, rotation, color, h, w, d }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Leather cover */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshPhysicalMaterial color={color} roughness={0.7} metalness={0.0}
          clearcoat={0.15} clearcoatRoughness={0.4} sheen={0.3} sheenColor="#a08060" envMapIntensity={0.3} />
      </mesh>
      {/* Round spine edge — cylinder */}
      <mesh position={[-w / 2, 0, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[h / 2, h / 2, d + 0.005, 20, 1, false, -Math.PI / 2, Math.PI]} />
        <meshPhysicalMaterial color={color} roughness={0.7} metalness={0.0}
          clearcoat={0.15} clearcoatRoughness={0.4} sheen={0.25} sheenColor="#a08060" />
      </mesh>
      {/* Spine gold band */}
      <mesh position={[-w / 2 + 0.012, 0, 0]}>
        <boxGeometry args={[0.024, h - 0.01, d + 0.006]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={0.8} clearcoatRoughness={0.08} />
      </mesh>
      {/* Pages block — cream with micro-edge detail */}
      <mesh position={[w / 2 - 0.02, 0, 0]}>
        <boxGeometry args={[0.04, h - 0.016, d - 0.018]} />
        <meshPhysicalMaterial color="#f4efe4" roughness={0.92} metalness={0.0}
          clearcoat={0.05} />
      </mesh>
      {/* Pages micro-lines (stacked thin slices) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[w / 2 - 0.018, -h / 2 + 0.015 + i * (h - 0.03) / 5 + (h - 0.03) / 10, 0]}>
          <boxGeometry args={[0.042, 0.004, d - 0.019]} />
          <meshPhysicalMaterial color="#e0dbd0" roughness={0.95} metalness={0.0} />
        </mesh>
      ))}
      {/* Top/bottom gold corner ornaments */}
      {[-h / 2 + 0.018, h / 2 - 0.018].map((y, i) => (
        <mesh key={i} position={[-w / 2 + 0.015, y, 0]}>
          <boxGeometry args={[0.03, 0.022, d + 0.004]} />
          <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.7} />
        </mesh>
      ))}
      {/* Gold title panel on spine */}
      <mesh position={[-w / 2 + 0.014, h * 0.18, 0]}>
        <boxGeometry args={[0.028, h * 0.3, d * 0.52]} />
        <meshPhysicalMaterial color="#c4982c" roughness={0.2} metalness={0.92}
          envMapIntensity={2.0} emissive="#b88020" emissiveIntensity={0.04}
          clearcoat={0.8} clearcoatRoughness={0.1} />
      </mesh>
      {/* Bookmark ribbon */}
      <mesh position={[w / 2 - 0.025, -h / 2 - 0.035, d * 0.2]}>
        <boxGeometry args={[0.015, 0.08, 0.008]} />
        <meshPhysicalMaterial color="#C9A84C" roughness={0.5} metalness={0.0}
          clearcoat={0.1} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function LawBooks() {
  const BOOKS = [
    { h: 0.24, w: 0.95, d: 0.66, color: '#5a1020' },
    { h: 0.20, w: 0.91, d: 0.63, color: '#182438' },
    { h: 0.23, w: 0.93, d: 0.64, color: '#183018' },
    { h: 0.19, w: 0.89, d: 0.62, color: '#28100a' },
    { h: 0.22, w: 0.92, d: 0.64, color: '#221a60' },
    { h: 0.18, w: 0.88, d: 0.61, color: '#1a2818' },
    { h: 0.21, w: 0.90, d: 0.63, color: '#3a1808' },
  ];
  const RY = [0.04, -0.05, 0.07, -0.03, 0.05, -0.06, 0.03];
  let cumY = 0;
  return (
    <group position={[3.4, -4.65, 0.45]}>
      {BOOKS.map((b, i) => {
        const yPos = cumY + b.h / 2;
        cumY += b.h;
        return (
          <LawBook key={i}
            position={[i * 0.025 - 0.08, yPos, 0]}
            rotation={[0, RY[i], 0]}
            color={b.color} h={b.h} w={b.w} d={b.d} />
        );
      })}
      {/* Gold bookend */}
      <mesh position={[-0.72, 0.28, 0]}>
        <boxGeometry args={[0.06, 0.58, 0.65]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.06}
          anisotropy={0.7} anisotropyRotation={0} />
      </mesh>
      <mesh position={[-0.72, -0.01, 0.34]}>
        <boxGeometry args={[0.06, 0.07, 0.65]} />
        <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.8} />
      </mesh>
      {/* Seal / medallion leaning on books */}
      <mesh position={[0.1, 0.62, 0.34]} rotation={[0.15, 0.2, 0.08]}>
        <cylinderGeometry args={[0.18, 0.18, 0.024, 40]} />
        <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.03}
          emissive="#C9A84C" emissiveIntensity={0.06} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   GAVEL — highly detailed
───────────────────────────────────────────── */
function GavelMesh({ gavelRef, onStrike }) {
  return (
    <Float speed={0.85} rotationIntensity={0.04} floatIntensity={0.2}>
      <group ref={gavelRef} position={[0.3, -0.5, 1.6]}
        rotation={[0.15, -0.25, -0.72]} scale={1.55}
        onClick={onStrike} style={{ cursor: 'pointer' }}>

        {/* ── HANDLE ── */}
        {/* Lower shaft — thick, lacquered rich rosewood */}
        <mesh position={[0, -3.1, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.215, 3.1, 52]} />
          <meshPhysicalMaterial color="#2c0e04" roughness={0.28} metalness={0.02}
            clearcoat={0.92} clearcoatRoughness={0.06}
            envMapIntensity={0.8} emissive="#3a1206" emissiveIntensity={0.015} />
        </mesh>
        {/* Upper shaft — tapers toward ferrule */}
        <mesh position={[0, -1.1, 0]} castShadow>
          <cylinderGeometry args={[0.105, 0.19, 2.0, 52]} />
          <meshPhysicalMaterial color="#351206" roughness={0.26} metalness={0.02}
            clearcoat={0.95} clearcoatRoughness={0.05}
            envMapIntensity={0.9} emissive="#3a1206" emissiveIntensity={0.01} />
        </mesh>
        {/* Wood grain bands — subtle color breaks for grain illusion */}
        {[-3.8, -3.2, -2.5, -1.8, -1.1].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.21 - Math.abs(y + 2.0) * 0.006, 0.006, 10, 44]} />
            <meshPhysicalMaterial color={i % 2 === 0 ? '#4a1a08' : '#1e0802'}
              roughness={0.32} metalness={0.0} clearcoat={0.6} />
          </mesh>
        ))}
        {/* Handle end cap — sculpted rounded base */}
        <mesh position={[0, -4.7, 0]} castShadow>
          <sphereGeometry args={[0.215, 44, 44]} />
          <meshPhysicalMaterial color="#200a02" roughness={0.32} metalness={0.0}
            clearcoat={0.88} clearcoatRoughness={0.08} />
        </mesh>
        {/* Gold base cap ring */}
        <mesh position={[0, -4.52, 0]}>
          <torusGeometry args={[0.212, 0.018, 16, 44]} />
          <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.03} />
        </mesh>
        {/* Leather grip wrapping — 8 tight bands */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, -1.85 + i * 0.22, 0]}>
            <torusGeometry args={[0.155 - i * 0.004, 0.014, 16, 44]} />
            <meshPhysicalMaterial color="#0a0402" roughness={0.92} metalness={0.0}
              clearcoat={0.04} sheenColor="#2a1008" sheen={0.2} />
          </mesh>
        ))}
        {/* Leather between grip bands — slightly raised strips */}
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0, -1.74 + i * 0.22, 0]}>
            <cylinderGeometry args={[0.152 - i * 0.003, 0.152 - i * 0.003, 0.19, 36]} />
            <meshPhysicalMaterial color="#160804" roughness={0.88} metalness={0.0}
              clearcoat={0.06} />
          </mesh>
        ))}

        {/* ── COLLAR / FERRULE ── */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.275, 0.285, 0.58, 48]} />
          <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.03}
            anisotropy={1.0} anisotropyRotation={Math.PI / 2}
            emissive="#C9A84C" emissiveIntensity={0.06} />
        </mesh>
        {/* Collar engraving rings */}
        {[-0.26, -0.09, 0.09, 0.26].map((y, i) => (
          <mesh key={i} position={[0, 0.08 + y, 0]}>
            <torusGeometry args={[0.287, i % 2 === 0 ? 0.011 : 0.007, 16, 48]} />
            <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.9}
              emissive="#b88020" emissiveIntensity={0.04} />
          </mesh>
        ))}
        {/* Ferrule top transition disk */}
        <mesh position={[0, 0.39, 0]}>
          <cylinderGeometry args={[0.24, 0.275, 0.06, 40]} />
          <meshPhysicalMaterial {...DARK_GOLD} clearcoat={0.8} />
        </mesh>

        {/* ── HEAD ── */}
        {/* Main barrel — high-lacquer dark rosewood, slight barrel crown */}
        <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.63, 0.62, 3.18, 80]} />
          <meshPhysicalMaterial color="#0e0402" roughness={0.18} metalness={0.18}
            clearcoat={1.0} clearcoatRoughness={0.03}
            envMapIntensity={2.8} emissive="#1a0804" emissiveIntensity={0.02} />
        </mesh>
        {/* Barrel crown (very slight bulge at center) */}
        <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.638, 0.638, 1.4, 80]} />
          <meshPhysicalMaterial color="#100502" roughness={0.16} metalness={0.2}
            clearcoat={1.0} clearcoatRoughness={0.02} envMapIntensity={3.0} />
        </mesh>
        {/* Left bevel taper 1 */}
        <mesh position={[-1.57, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.56, 0.62, 0.17, 72]} />
          <meshPhysicalMaterial color="#100604" roughness={0.24} metalness={0.12}
            clearcoat={0.9} clearcoatRoughness={0.05} />
        </mesh>
        {/* Left bevel taper 2 */}
        <mesh position={[-1.72, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.56, 0.12, 72]} />
          <meshPhysicalMaterial color="#0a0402" roughness={0.26} metalness={0.1}
            clearcoat={0.85} clearcoatRoughness={0.06} />
        </mesh>
        {/* Right bevel taper 1 */}
        <mesh position={[1.57, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.56, 0.62, 0.17, 72]} />
          <meshPhysicalMaterial color="#100604" roughness={0.24} metalness={0.12}
            clearcoat={0.9} clearcoatRoughness={0.05} />
        </mesh>
        {/* Right bevel taper 2 */}
        <mesh position={[1.72, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.56, 0.12, 72]} />
          <meshPhysicalMaterial color="#0a0402" roughness={0.26} metalness={0.1}
            clearcoat={0.85} clearcoatRoughness={0.06} />
        </mesh>

        {/* Gold accent rings */}
        {[-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5].map((x, i) => (
          <mesh key={i} position={[x, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.624, 0.624, i === 3 ? 0.18 : 0.055, 72]} />
            <meshPhysicalMaterial
              color={i === 3 ? '#e8d050' : '#C9A84C'}
              roughness={i === 3 ? 0.04 : 0.07}
              metalness={1.0}
              envMapIntensity={i === 3 ? 4.5 : 3.5}
              emissive={i === 3 ? '#d4b020' : '#C9A84C'}
              emissiveIntensity={i === 3 ? 0.1 : 0.04}
              clearcoat={1.0}
              clearcoatRoughness={0.02}
              anisotropy={0.9}
              anisotropyRotation={Math.PI / 2}
            />
          </mesh>
        ))}

        {/* Strike faces — dark lacquered */}
        {[-1.58, 1.58].map((x, i) => (
          <mesh key={i} position={[x, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
            <circleGeometry args={[0.40, 48]} />
            <meshPhysicalMaterial color="#080402" roughness={0.14} metalness={0.55}
              clearcoat={1.0} clearcoatRoughness={0.02} envMapIntensity={1.8} />
          </mesh>
        ))}
        {/* Strike face inner inset circle */}
        {[-1.575, 1.575].map((x, i) => (
          <mesh key={i} position={[x, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
            <ringGeometry args={[0.28, 0.38, 48]} />
            <meshPhysicalMaterial {...GOLD} clearcoat={1.0} clearcoatRoughness={0.02}
              transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────────────
   SCROLL / DOCUMENT PROP
───────────────────────────────────────────── */
function DocumentScroll() {
  return (
    <group position={[1.8, -4.55, 0.5]} rotation={[0.08, -0.3, 0.05]}>
      {/* Paper roll */}
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.055, 1.1, 20]} />
        <meshPhysicalMaterial color="#f4efe2" roughness={0.85} metalness={0.0} clearcoat={0.1} />
      </mesh>
      {/* Gold seal caps */}
      {[-0.56, 0.56].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.02, 20]} />
          <meshPhysicalMaterial {...GOLD} clearcoat={0.9} />
        </mesh>
      ))}
      {/* Unrolled paper face */}
      <mesh position={[0, 0.1, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.9]} />
        <meshPhysicalMaterial color="#f8f4ea" roughness={0.9} metalness={0.0}
          clearcoat={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Paper lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, -0.28 + i * 0.09, 0.065]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.44, 0.007]} />
          <meshPhysicalMaterial color="#c8c0a8" roughness={1.0} metalness={0.0}
            side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Red wax seal */}
      <mesh position={[0.08, -0.32, 0.067]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.055, 20]} />
        <meshPhysicalMaterial color="#8b1a1a" roughness={0.4} metalness={0.0}
          clearcoat={0.6} clearcoatRoughness={0.15} emissive="#6a1010" emissiveIntensity={0.05} />
      </mesh>
    </group>
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

  useFrame(({ mouse, clock }) => {
    if (sceneRef.current) {
      /* Ultra-smooth parallax — lower lerp = more inertia */
      sceneRef.current.rotation.y = THREE.MathUtils.lerp(
        sceneRef.current.rotation.y, (mouse.x * Math.PI) / 22, 0.022);
      sceneRef.current.rotation.x = THREE.MathUtils.lerp(
        sceneRef.current.rotation.x, (-mouse.y * Math.PI) / 42, 0.022);
    }
    if (gavelRef.current && !isStriking) {
      /* Slow, stately idle rotation */
      gavelRef.current.rotation.y += 0.001;
      /* Subtle breathe — tiny up/down sine */
      gavelRef.current.position.y = -0.5 + Math.sin(clock.getElapsedTime() * 0.5) * 0.025;
    }
  });

  const handleStrike = () => {
    if (isStriking || !gavelRef.current || !rippleRef.current) return;
    setIsStriking(true);
    const gavel = gavelRef.current;
    const ripple = rippleRef.current;

    const tl = gsap.timeline({ onComplete: () => { setIsStriking(false); onStrikeComplete(); } });
    /* Wind-up — smooth power3 in */
    tl.to(gavel.rotation, { z: -1.25, x: -0.12, duration: 0.18, ease: 'power3.in' });
    /* Strike down — fast power4 */
    tl.to(gavel.rotation, { z: 0.18, x: 0.75, duration: 0.19, ease: 'power4.in' });
    tl.to(gavel.position, { y: -1.18, duration: 0.19, ease: 'power4.in' }, '<');
    /* Impact effects */
    tl.add(() => {
      ripple.scale.set(0.04, 0.04, 0.04);
      ripple.material.opacity = 0.95;
      gsap.to(ripple.scale, { x: 14, y: 14, z: 14, duration: 1.8, ease: 'power2.out' });
      gsap.to(ripple.material, { opacity: 0, duration: 1.8, ease: 'power2.out' });
      /* Camera shake */
      [
        [55, 'translate(4px,4px)'],
        [110, 'translate(-4px,-3px)'],
        [165, 'translate(3px,-3px)'],
        [220, 'translate(-2px,2px)'],
        [275, 'translate(0,0)'],
      ].forEach(([t, v]) => setTimeout(() => { document.body.style.transform = v; }, t));
    }, '-=0.02');
    /* Elastic bounce-back — tuned for smooth settle */
    tl.to(gavel.rotation, { z: -0.72, x: 0.15, duration: 1.5, ease: 'elastic.out(1,0.3)' }, '+=0.05');
    tl.to(gavel.position, { y: -0.5, duration: 1.2, ease: 'elastic.out(1,0.38)' }, '<');
  };

  window.triggerGavelStrike = handleStrike;

  return (
    <group ref={sceneRef}>
      {/* ── Lighting ── */}
      <ambientLight intensity={0.35} color="#fff0e0" />
      {/* Key light — warm top-right */}
      <directionalLight position={[6, 18, 8]} intensity={3.6} color="#fff8f0" castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={0.5} shadow-camera-far={55}
        shadow-camera-left={-16} shadow-camera-right={16}
        shadow-camera-top={16} shadow-camera-bottom={-16}
        shadow-bias={-0.0003} shadow-normalBias={0.02} />
      {/* Burgundy dramatic fill from left */}
      <spotLight position={[-14, 12, 7]} intensity={5.0} color="#7C1D2B"
        angle={0.36} penumbra={0.85} castShadow />
      {/* Gold rim light directly behind gavel */}
      <pointLight position={[1.8, 2.5, 5]} intensity={3.2} color="#C9A84C" distance={20} decay={2} />
      {/* Warm backfill */}
      <pointLight position={[-3.5, -0.5, 5]} intensity={1.2} color="#8B3520" distance={22} decay={2} />
      {/* Cool overhead for pillars */}
      <pointLight position={[0, 10, -2]} intensity={1.4} color="#dcdce8" distance={32} decay={1.5} />
      {/* Under-glow gold bounce */}
      <pointLight position={[0.3, -3.8, 2.5]} intensity={0.8} color="#C9A84C" distance={14} decay={2} />
      {/* Left fill to balance */}
      <pointLight position={[-7, 3, 3]} intensity={0.7} color="#e8d4c0" distance={20} decay={2} />

      <Environment preset="warehouse" />

      <BackWall />
      <MarbleFloor />
      <Pillars />
      <JudgeBench />
      <SoundBlock />
      <ScalesOfJustice />
      <LawBooks />
      <DocumentScroll />
      <Candles />

      <GavelMesh gavelRef={gavelRef} onStrike={handleStrike} />

      {/* Strike ripple */}
      <mesh ref={rippleRef} position={[0.3, -4.52, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.15, 80]} />
        <meshBasicMaterial color="#C9A84C" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      <Sparkles count={240} scale={22} size={1.4} speed={0.14} color="#C9A84C" opacity={0.32} />
      <ContactShadows position={[0, -5.14, 0]} opacity={0.85} scale={36} blur={3.5} far={10} color="#1a0a04" />
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

  /* Silky expo-out curve — snappy start, smooth landing */
  const EASE_OUT = [0.16, 1, 0.3, 1];
  const EASE_IN  = [0.4, 0, 1, 1];

  const wordVariants = {
    hidden: { opacity: 0, y: 28, filter: 'blur(12px)' },
    visible: (i) => ({
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { delay: i * 0.09, duration: 1.0, ease: EASE_OUT },
    }),
    dust: {
      opacity: 0, y: -50, filter: 'blur(24px)', scale: 1.03,
      transition: { duration: 1.1, ease: EASE_IN },
    },
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background z-[1] pointer-events-none" />

      <motion.div className="absolute inset-0 z-0"
        animate={isStruck
          ? { opacity: 0, filter: 'blur(6px)', transition: { duration: 1.6, ease: EASE_IN } }
          : { opacity: 1, filter: 'blur(0px)' }}>
        {checkWebGL() ? (
          <Canvas
            camera={{ position: [0, 1.5, 13], fov: 42 }}
            shadows
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
              powerPreference: 'high-performance',
            }}>
            <GavelScene onStrikeComplete={handleStrikeComplete} />
          </Canvas>
        ) : (
          <StaticHeroBackground />
        )}
      </motion.div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        <div className="max-w-4xl mx-auto mt-16">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            {'Justice Powered by Intelligence'.split(' ').map((word, i) => (
              <motion.span key={i} custom={i} variants={wordVariants} initial="hidden"
                animate={isStruck ? 'dust' : 'visible'}
                className="inline-block mr-3 md:mr-4"
                style={{ textShadow: '0 2px 24px rgba(255,255,255,0.55)' }}>
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="text-xl md:text-2xl text-foreground/75 font-light mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isStruck
              ? { opacity: 0, y: -40, filter: 'blur(16px)', transition: { duration: 0.9, ease: EASE_IN } }
              : { opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 0.54, duration: 1.0, ease: EASE_OUT } }}>
            Gavel &amp; Brief — The Future of Legal Technology
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isStruck
              ? { opacity: 0, y: -30, transition: { duration: 0.7, ease: EASE_IN } }
              : { opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.9, ease: EASE_OUT } }}>
            <button onClick={triggerStrike}
              className="bg-primary text-primary-foreground px-9 py-4 rounded-sm font-semibold text-lg transition-all duration-500 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 relative overflow-hidden group w-full sm:w-auto">
              <span className="relative z-10">Begin Experience</span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </button>
            <button
              className="border border-foreground/20 text-foreground px-9 py-4 rounded-sm font-semibold text-lg transition-all duration-500 hover:bg-foreground/5 hover:border-foreground/40 w-full sm:w-auto backdrop-blur-sm"
              onClick={() => { const s = document.getElementById('features'); if (s) s.scrollIntoView({ behavior: 'smooth' }); }}>
              Learn More
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
