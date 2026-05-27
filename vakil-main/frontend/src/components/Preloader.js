import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    const duration = 2400;
    let raf;

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setProgress(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 600);
        }, 220);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const ribbonVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: '#ffffff' }}
        >
          {/* Gold circle pattern overlay — subtle */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${process.env.PUBLIC_URL}/gold-pattern.png)`,
              backgroundRepeat: 'repeat',
              backgroundSize: '72px 72px',
              opacity: 0.18,
            }}
          />

          {/* LEFT — Gold ribbon / fold animation */}
          <motion.div
            className="absolute left-0 bottom-0 pointer-events-none"
            style={{ width: '42%', maxWidth: 520 }}
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {/* Animated gold ribbon image — unfolds from lower-left */}
            <motion.img
              src={`${process.env.PUBLIC_URL}/gold-ribbon.png`}
              alt=""
              className="w-full h-auto select-none"
              style={{ transformOrigin: 'bottom left' }}
              initial={{ scaleX: 0.0, scaleY: 0.3, opacity: 0, rotate: -18 }}
              animate={{ scaleX: 1, scaleY: 1, opacity: 1, rotate: 0 }}
              transition={{
                duration: 1.5,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.15,
                opacity: { duration: 0.6, delay: 0.15 },
              }}
            />

            {/* Shimmer sweep across ribbon */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)',
                backgroundSize: '200% 100%',
              }}
              initial={{ backgroundPosition: '-100% 0' }}
              animate={{ backgroundPosition: '200% 0' }}
              transition={{ duration: 1.4, ease: 'linear', delay: 1.0, repeat: Infinity, repeatDelay: 2 }}
            />
          </motion.div>

          {/* CENTER — Logo + name + loading */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            {/* Logo */}
            <motion.div
              animate={{ scale: [1, 1.04, 1], rotate: [0, -4, 4, -2, 0] }}
              transition={{ duration: 2.0, delay: 0.5, ease: 'easeInOut' }}
              className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center"
              style={{
                boxShadow: '0 8px 40px rgba(201,168,76,0.35), 0 2px 12px rgba(109,7,26,0.18)',
                border: '2px solid rgba(201,168,76,0.3)',
              }}
            >
              <img
                src="/logo.png"
                alt="VakilSetu"
                className="w-full h-full object-contain"
                style={{ background: 'transparent' }}
              />
            </motion.div>

            {/* Name */}
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.65 }}
                className="font-serif text-4xl font-bold mb-1"
                style={{ color: '#6D071A', letterSpacing: '-0.02em' }}
              >
                VakilSetu
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="text-sm font-light tracking-widest uppercase"
                style={{ color: '#C9A84C' }}
              >
                Legal Intelligence Platform
              </motion.p>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.45 }}
              className="w-72 mt-1"
            >
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(109,7,26,0.10)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #C9A84C, #e8c96a)',
                    boxShadow: '0 0 10px rgba(201,168,76,0.5)',
                  }}
                />
              </div>
              <p
                className="text-center mt-2 text-xs"
                style={{ color: 'rgba(109,7,26,0.45)', fontVariantNumeric: 'tabular-nums' }}
              >
                {progress}%
              </p>
            </motion.div>

            {/* Pulsing dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#C9A84C' }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
