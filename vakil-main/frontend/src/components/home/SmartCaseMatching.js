import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const NODES = [
  { cx: 200, cy: 55,  delay: 1.6, label: 'Contract',  labelX: 200, labelY: 32,  anchor: 'middle' },
  { cx: 345, cy: 110, delay: 1.8, label: 'Criminal',  labelX: 362, labelY: 113, anchor: 'start'  },
  { cx: 335, cy: 305, delay: 2.0, label: 'Corporate', labelX: 354, labelY: 309, anchor: 'start'  },
  { cx: 82,  cy: 328, delay: 2.2, label: 'Property',  labelX: 63,  labelY: 332, anchor: 'end'    },
  { cx: 72,  cy: 155, delay: 2.4, label: 'Family',    labelX: 53,  labelY: 158, anchor: 'end'    },
];

export default function SmartCaseMatching() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: '-80px' });
  const [animKey, setAnimKey] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  const handleCenterClick = () => {
    setAnimKey(k => k + 1);
    setPulseKey(k => k + 1);
  };

  return (
    <section id="platform" className="py-32 px-6 md:px-12 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16" ref={sectionRef}>
        <div className="lg:w-1/2">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-4">02 — Smart Matching</motion.p>

          <motion.h2 initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }} animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Smarter Legal<br />Connections
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.25 }}
            className="text-lg text-foreground/65 font-light mb-8 leading-relaxed">
            Finding the right representation shouldn't be a gamble. Gavel &amp; Brief analyses case details against thousands of lawyer profiles, success rates, and specialisations to forge perfect matches.
          </motion.p>

          <motion.ul initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.4 }} className="space-y-4">
            {['Jurisdiction-aware matching algorithms', 'Historical success rate analysis', 'Complexity vs. Experience evaluation'].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <span className="text-foreground/75 text-sm">{item}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="lg:w-1/2 w-full max-w-[500px] mx-auto" style={{ aspectRatio: '1/1' }}>
          <svg key={animKey} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#9b2335" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#7C1D2B" stopOpacity="0" />
              </radialGradient>
              <filter id="nodeShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#7C1D2B" floodOpacity="0.55" />
              </filter>
              <filter id="goldGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#C9A84C" floodOpacity="0.65" />
              </filter>
            </defs>

            <circle cx="200" cy="200" r="158" stroke="#C9A84C" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="5 8" />
            <circle cx="200" cy="200" r="96" stroke="#C9A84C" strokeOpacity="0.11" strokeWidth="1" strokeDasharray="4 7" />

            {NODES.map((n, i) => (
              <motion.line key={`line-${i}`} x1="200" y1="200" x2={n.cx} y2={n.cy}
                stroke="#C9A84C" strokeOpacity="0.5" strokeWidth="1.1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 1.0, delay: n.delay - 0.5, ease: 'easeInOut' }} />
            ))}

            <motion.circle cx="200" cy="200" r="58" fill="url(#centerGlow)"
              initial={{ scale: 0, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }} style={{ transformOrigin: '200px 200px' }} />

            <motion.circle cx="200" cy="200" r="30" fill="#7C1D2B" filter="url(#nodeShadow)"
              initial={{ scale: 0 }} animate={isInView ? { scale: [0, 1.18, 1] } : {}}
              transition={{ duration: 0.6, delay: 0.4, type: 'spring', stiffness: 200 }}
              style={{ transformOrigin: '200px 200px', cursor: 'pointer' }}
              onClick={handleCenterClick} />

            <motion.line x1="193" y1="200" x2="207" y2="200" stroke="rgba(255,255,255,0.5)" strokeWidth="2"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.85 }} style={{ pointerEvents: 'none' }} />
            <motion.line x1="200" y1="193" x2="200" y2="207" stroke="rgba(255,255,255,0.5)" strokeWidth="2"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.85 }} style={{ pointerEvents: 'none' }} />

            <motion.circle key={`pulse-${pulseKey}`} cx="200" cy="200" r="30" fill="none" stroke="#7C1D2B" strokeWidth="1.2"
              animate={isInView ? { r: [30, 50, 30], opacity: [0.7, 0, 0.7] } : {}}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1.0 }} />

            {NODES.map((n, i) => (
              <motion.g key={`node-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: n.delay, type: 'spring', stiffness: 180 }}
                style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}>
                <circle cx={n.cx} cy={n.cy} r="14" fill="none" stroke="#C9A84C" strokeWidth="2.2" filter="url(#goldGlow)" />
                <circle cx={n.cx} cy={n.cy} r="11" fill="#f8f4ee" />
                <circle cx={n.cx} cy={n.cy} r="3.5" fill="#C9A84C" opacity="0.65" />
                <text x={n.labelX} y={n.labelY} textAnchor={n.anchor} fill="#7C1D2B" fontSize="9"
                  fontFamily="serif" fontWeight="600" letterSpacing="0.08em">
                  {n.label.toUpperCase()}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
