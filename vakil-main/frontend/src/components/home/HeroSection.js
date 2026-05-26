import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import gsap from 'gsap';

function checkWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

function CursorTrail() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const history = [];
    const MAX = 48;

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      history.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (history.length > MAX) history.shift();
    };
    window.addEventListener('mousemove', onMove);

    let raf;
    const tick = () => {
      const W = canvas.width / dpr, H = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (history.length > 1) {
        // Draw a single smooth fading line through all history points
        for (let i = 1; i < history.length; i++) {
          const prog = i / history.length;
          const alpha = Math.pow(prog, 1.8) * 0.9;
          const lineWidth = 1.2 + prog * 2.0;

          ctx.beginPath();
          ctx.moveTo(history[i - 1].x, history[i - 1].y);
          ctx.lineTo(history[i].x, history[i].y);
          ctx.strokeStyle = `rgba(201,168,76,${alpha})`;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = '#C9A84C';
          ctx.shadowBlur = prog > 0.75 ? 10 : 0;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Bright head dot at cursor tip
        const head = history[history.length - 1];
        ctx.beginPath();
        ctx.arc(head.x, head.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,230,80,0.95)';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 25 }} />;
}

function SoundBlock() {
  return (
    <group position={[0.3, -4.63, 0.2]}>
      <mesh castShadow>
        <boxGeometry args={[1.9, 0.28, 1.05]} />
        <meshStandardMaterial color="#2e1506" roughness={0.42} metalness={0.08} envMapIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.155, 0]} castShadow>
        <boxGeometry args={[1.65, 0.06, 0.82]} />
        <meshStandardMaterial color="#4a2010" roughness={0.48} metalness={0.04} />
      </mesh>
      {[-0.82, 0.82].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0]}>
          <boxGeometry args={[0.055, 0.3, 1.06]} />
          <meshStandardMaterial color="#C9A84C" roughness={0.12} metalness={0.94} envMapIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}

function JudgeBench() {
  return (
    <group position={[0, -4.8, -1.2]}>
      <mesh receiveShadow>
        <boxGeometry args={[16, 0.32, 3.8]} />
        <meshStandardMaterial color="#1e0c04" roughness={0.38} metalness={0.1} envMapIntensity={0.9} />
      </mesh>
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[16, 0.06, 3.8]} />
        <meshStandardMaterial color="#160a03" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, -1.35, 1.78]} receiveShadow>
        <boxGeometry args={[16, 2.5, 0.22]} />
        <meshStandardMaterial color="#2a1208" roughness={0.45} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.19, 1.8]}>
        <boxGeometry args={[16, 0.07, 0.08]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.14} metalness={0.92} envMapIntensity={1.6} />
      </mesh>
      <mesh position={[0, -2.49, 1.78]}>
        <boxGeometry args={[16, 0.06, 0.08]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.14} metalness={0.92} />
      </mesh>
    </group>
  );
}

function PillarWithFluting({ position }) {
  const FLUTES = 10;
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.32, 9.5, 28]} />
        <meshStandardMaterial color="#d8d0c0" roughness={0.72} metalness={0.04} />
      </mesh>
      {Array.from({ length: FLUTES }).map((_, i) => {
        const angle = (i / FLUTES) * Math.PI * 2;
        const r = 0.28;
        return (
          <mesh key={i} position={[Math.sin(angle) * r, 0.5, Math.cos(angle) * r]} rotation={[0, -angle, 0]} castShadow>
            <boxGeometry args={[0.038, 9.1, 0.022]} />
            <meshStandardMaterial color="#c2b8a6" roughness={0.8} metalness={0.02} />
          </mesh>
        );
      })}
      <group position={[0, 5.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.42, 0.28, 0.32, 28]} />
          <meshStandardMaterial color="#cec4b4" roughness={0.68} metalness={0.03} />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.88, 0.22, 0.88]} />
          <meshStandardMaterial color="#c8bead" roughness={0.7} metalness={0.03} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.0, 0.12, 1.0]} />
          <meshStandardMaterial color="#beb4a4" roughness={0.7} metalness={0.03} />
        </mesh>
      </group>
      <group position={[0, -4.52, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.24, 28]} />
          <meshStandardMaterial color="#cec4b4" roughness={0.68} metalness={0.03} />
        </mesh>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.92, 0.14, 0.92]} />
          <meshStandardMaterial color="#c8bead" roughness={0.7} metalness={0.03} />
        </mesh>
        <mesh position={[0, -0.36, 0]}>
          <boxGeometry args={[1.05, 0.1, 1.05]} />
          <meshStandardMaterial color="#beb4a4" roughness={0.7} metalness={0.03} />
        </mesh>
      </group>
    </group>
  );
}

function Pillars() {
  return (
    <>
      {[-6.5, 6.5, -10, 10].map((x, i) => (
        <PillarWithFluting key={i} position={[x, 0, -3.5]} />
      ))}
      <mesh position={[0, 5.65, -3.5]}>
        <boxGeometry args={[22, 0.38, 0.32]} />
        <meshStandardMaterial color="#cec4b4" roughness={0.7} metalness={0.03} />
      </mesh>
    </>
  );
}

function ScalesOfJustice() {
  return (
    <group position={[-3.2, -4.65, 0.3]}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.60, 0.18, 32]} />
        <meshStandardMaterial color="#cec8bc" roughness={0.38} metalness={0.06} envMapIntensity={0.7} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.06, 32]} />
        <meshStandardMaterial color="#beb8ac" roughness={0.5} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.04, 2.0, 16]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.18} metalness={0.92} envMapIntensity={2} />
      </mesh>
      <mesh position={[0, 2.08, 0]}>
        <sphereGeometry args={[0.065, 20, 20]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.14} metalness={0.94} envMapIntensity={2} />
      </mesh>
      <mesh position={[0, 2.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.8, 12]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.18} metalness={0.92} envMapIntensity={2} />
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.14} metalness={0.94} />
      </mesh>
      <mesh position={[-0.9, 1.58, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.88, 8]} />
        <meshStandardMaterial color="#b8a83e" roughness={0.22} metalness={0.88} />
      </mesh>
      <mesh position={[-0.9, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.30, 0.30, 0.04, 28]} />
        <meshStandardMaterial color="#b8a03a" roughness={0.3} metalness={0.82} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[0.9, 1.58, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.88, 8]} />
        <meshStandardMaterial color="#b8a83e" roughness={0.22} metalness={0.88} />
      </mesh>
      <mesh position={[0.9, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.30, 0.30, 0.04, 28]} />
        <meshStandardMaterial color="#b8a03a" roughness={0.3} metalness={0.82} envMapIntensity={1.4} />
      </mesh>
    </group>
  );
}

function LawBooks() {
  const BOOKS = [
    { h: 0.22, w: 0.92, d: 0.62, color: '#7C1D2B', ry: 0.04 },
    { h: 0.18, w: 0.88, d: 0.60, color: '#1a2535', ry: -0.05 },
    { h: 0.20, w: 0.90, d: 0.61, color: '#1a3a1a', ry: 0.06 },
    { h: 0.16, w: 0.86, d: 0.58, color: '#2d1008', ry: -0.04 },
  ];
  let cumY = 0;
  return (
    <group position={[3.4, -4.65, 0.3]}>
      {BOOKS.map((b, i) => {
        const y = cumY + b.h / 2;
        cumY += b.h;
        return (
          <group key={i} position={[i * 0.04 - 0.06, y, 0]} rotation={[0, b.ry, 0]}>
            <mesh castShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial color={b.color} roughness={0.58} metalness={0.04} />
            </mesh>
            <mesh position={[-b.w / 2 + 0.014, 0, 0]}>
              <boxGeometry args={[0.03, b.h, b.d + 0.01]} />
              <meshStandardMaterial color="#C9A84C" roughness={0.18} metalness={0.88} envMapIntensity={1.4} />
            </mesh>
            <mesh position={[b.w / 2 - 0.022, 0, 0]}>
              <boxGeometry args={[0.044, b.h - 0.01, b.d - 0.012]} />
              <meshStandardMaterial color="#f5f0e8" roughness={0.82} metalness={0.0} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

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
      gavelRef.current.rotation.y += 0.002;
    }
  });

  const handleStrike = () => {
    if (isStriking || !gavelRef.current || !rippleRef.current) return;
    setIsStriking(true);
    const gavel = gavelRef.current;
    const ripple = rippleRef.current;

    const tl = gsap.timeline({
      onComplete: () => { setIsStriking(false); onStrikeComplete(); },
    });

    tl.to(gavel.rotation, { z: -1.18, x: -0.08, duration: 0.17, ease: 'power2.in' });
    tl.to(gavel.rotation, { z: 0.18, x: 0.68, duration: 0.21, ease: 'power4.in' });
    tl.to(gavel.position, { y: -1.1, duration: 0.21, ease: 'power4.in' }, '<');

    tl.add(() => {
      ripple.scale.set(0.05, 0.05, 0.05);
      ripple.material.opacity = 0.9;
      gsap.to(ripple.scale, { x: 9, y: 9, z: 9, duration: 1.2, ease: 'power2.out' });
      gsap.to(ripple.material, { opacity: 0, duration: 1.2, ease: 'power2.out' });

      document.body.style.transform = 'translate(5px,5px)';
      setTimeout(() => { document.body.style.transform = 'translate(-5px,-3px)'; }, 55);
      setTimeout(() => { document.body.style.transform = 'translate(4px,-4px)'; }, 115);
      setTimeout(() => { document.body.style.transform = 'translate(0,0)'; }, 175);
    }, '-=0.02');

    tl.to(gavel.rotation, { z: -0.72, x: 0.15, duration: 1.25, ease: 'elastic.out(1,0.36)' }, '+=0.06');
    tl.to(gavel.position, { y: -0.5, duration: 0.95, ease: 'elastic.out(1,0.44)' }, '<');
  };

  window.triggerGavelStrike = handleStrike;

  return (
    <group ref={sceneRef}>
      <ambientLight intensity={0.5} color="#fff8f2" />
      <directionalLight position={[5, 14, 7]} intensity={2.8} color="#fff5e8" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-near={0.5} shadow-camera-far={40}
        shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
      <spotLight position={[-10, 10, 5]} intensity={3.5} color="#7C1D2B" angle={0.4} penumbra={0.7} castShadow />
      <pointLight position={[4, 3, 7]} intensity={1.6} color="#C9A84C" distance={22} />
      <pointLight position={[-4, -1, 4]} intensity={0.7} color="#7C1D2B" distance={18} />

      <Environment preset="lobby" />

      <Pillars />
      <JudgeBench />
      <SoundBlock />
      <ScalesOfJustice />
      <LawBooks />

      <Float speed={1.0} rotationIntensity={0.06} floatIntensity={0.25}>
        <group ref={gavelRef} position={[0.3, -0.5, 1.5]} rotation={[0.15, -0.25, -0.72]} scale={1.5} onClick={handleStrike}>
          <mesh position={[0, -2.0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.21, 4.4, 40]} />
            <meshStandardMaterial color="#5c2d0e" roughness={0.5} metalness={0.04} envMapIntensity={0.6} />
          </mesh>
          <mesh position={[0, -4.22, 0]}>
            <sphereGeometry args={[0.21, 24, 24]} />
            <meshStandardMaterial color="#4a230c" roughness={0.52} metalness={0.04} />
          </mesh>
          <mesh position={[0, 0.0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.46, 36]} />
            <meshStandardMaterial color="#C9A84C" roughness={0.12} metalness={0.95} envMapIntensity={2.2} />
          </mesh>
          <mesh position={[0, 0.56, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.58, 0.58, 2.9, 56]} />
            <meshStandardMaterial color="#2b0f06" roughness={0.36} metalness={0.22} envMapIntensity={1.8} />
          </mesh>
          {[-1.45, 1.45].map((x, i) => (
            <mesh key={i} position={[x, 0.56, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.58, 0.58, 0.02, 56]} />
              <meshStandardMaterial color="#180904" roughness={0.58} metalness={0.06} />
            </mesh>
          ))}
          {[-1.38, 1.38].map((x, i) => (
            <mesh key={i} position={[x, 0.56, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.62, 0.62, 0.24, 56]} />
              <meshStandardMaterial color="#C9A84C" roughness={0.11} metalness={0.97} envMapIntensity={2.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.56, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.597, 0.597, 0.2, 56]} />
            <meshStandardMaterial color="#b8913e" roughness={0.15} metalness={0.92} envMapIntensity={2.0} />
          </mesh>
          {[-0.72, 0.72].map((x, i) => (
            <mesh key={i} position={[x, 0.56, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.593, 0.593, 0.11, 56]} />
              <meshStandardMaterial color="#C9A84C" roughness={0.16} metalness={0.9} envMapIntensity={2.0} />
            </mesh>
          ))}
        </group>
      </Float>

      <mesh ref={rippleRef} position={[0.3, -4.52, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.05, 64]} />
        <meshBasicMaterial color="#C9A84C" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      <Sparkles count={160} scale={18} size={1.6} speed={0.25} color="#C9A84C" opacity={0.5} />
      <ContactShadows position={[0, -5.1, 0]} opacity={0.55} scale={26} blur={2.8} far={6} color="#3a1a08" />
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

      <CursorTrail />

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
