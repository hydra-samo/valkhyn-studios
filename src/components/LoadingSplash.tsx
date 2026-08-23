import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, animate, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import { HydraLogo } from './HydraLogo';
import { ease, duration } from '../lib/motionTokens';

interface LoadingSplashProps {
  onComplete: () => void;
}

const BAR_DURATION = 1.9;
const SETTLE_DELAY = 500;
const HARD_CAP = 4500;

/**
 * Moody cinematic loading splash. A dark abyssal emerald canvas with drifting
 * organic blobs, cursor-following spotlight, film grain, and a pulsing Hydra
 * mark. The ambient background shows through from behind (the splash has a
 * solid dark base so the rest of the UI is hidden). Reduced-motion users
 * jump straight to the content.
 */
export const LoadingSplash: React.FC<LoadingSplashProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const progress = useMotionValue(0);
  const barWidth = useTransform(progress, (v) => `${v}%`);
  const [percent, setPercent] = useState(0);

  // Cursor spotlight
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -500, y: -500 });

  const onPointerMove = useCallback((e: PointerEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate(${mouseRef.current.x - 300}px, ${mouseRef.current.y - 300}px)`;
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onPointerMove]);

  useEffect(() => {
    if (reduceMotion) {
      onComplete();
      return;
    }

    const controls = animate(progress, 100, {
      duration: BAR_DURATION,
      ease: ease.cinematic,
      onUpdate: (v) => setPercent(Math.round(v)),
    });

    const settle = window.setTimeout(onComplete, BAR_DURATION * 1000 + SETTLE_DELAY);
    const hardCap = window.setTimeout(onComplete, HARD_CAP);

    return () => {
      controls.stop();
      window.clearTimeout(settle);
      window.clearTimeout(hardCap);
    };
  }, [reduceMotion, onComplete, progress]);

  return (
    <motion.div
      key="loading-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.02,
        filter: 'blur(8px)',
        transition: { duration: duration.mid, ease: ease.cinematic },
      }}
      onClick={onComplete}
      title={t('splash.skip')}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer"
      style={{ background: '#060c09' }}
    >
      {/* Deep radial emerald wash — the abyssal canvas foundation */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 50% -10%, rgba(16,185,129,0.06), transparent 55%), radial-gradient(120% 120% at 90% 110%, rgba(5,150,105,0.07), transparent 60%)',
        }}
      />

      {/* Emerald crown — top-left bloom, drifts slowly */}
      <motion.div
        aria-hidden="true"
        className="absolute -top-[18%] -left-[12%] h-[72vh] w-[72vh] rounded-full"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)',
        }}
      />

      {/* Jade abyss — bottom-right bloom, counter-pulses */}
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-[22%] -right-[10%] h-[78vh] w-[78vh] rounded-full"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{
          background: 'radial-gradient(circle, rgba(5,150,105,0.16) 0%, transparent 65%)',
        }}
      />

      {/* Aurora wash — drifting mid-layer glow */}
      <motion.div
        aria-hidden="true"
        className="absolute top-[20%] left-[15%] h-[50vh] w-[50vh] rounded-full"
        animate={{
          y: ['0vh', '30vh', '0vh'],
          opacity: [0.08, 0.18, 0.08],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(52,211,153,0.09) 0%, rgba(16,185,129,0.04) 45%, transparent 70%)',
        }}
      />

      {/* Organic drifting blobs — CSS animation for subtle life */}
      <div
        aria-hidden="true"
        className="ambient-blob ambient-blob--a -top-[18vh] -left-[14vw] h-[55vw] w-[55vw]"
        style={{ background: 'rgba(16,185,129,0.06)' }}
      />
      <div
        aria-hidden="true"
        className="ambient-blob ambient-blob--b top-[38vh] -right-[16vw] h-[48vw] w-[48vw]"
        style={{ background: 'rgba(5,150,105,0.05)' }}
      />

      {/* Film grain overlay */}
      <svg
        aria-hidden="true"
        className="film-grain absolute inset-0 h-full w-full opacity-[0.04] mix-blend-overlay pointer-events-none"
      >
        <filter id="splash-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#splash-grain)" />
      </svg>

      {/* Cursor spotlight — fine pointer only */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="cursor-spotlight absolute top-0 left-0 -ml-[300px] -mt-[300px] h-[600px] w-[600px] rounded-full pointer-events-none will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(226,166,74,0.06) 0%, transparent 65%)',
        }}
      />

      {/* Center content — sits above the ambient layer */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ opacity: [0.15, 1, 0.15] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          <HydraLogo className="h-12 w-12 sm:h-14 sm:w-14 text-accent hydra-mark-glow" />
        </motion.div>

        <span className="mt-5 font-display text-sm sm:text-base font-bold uppercase tracking-[0.35em] text-[var(--text-main)]">
          HYDRA SAMO
        </span>

        <div className="mt-8 w-44 sm:w-56" aria-hidden="true">
          <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#059669] via-[#10b981] to-[#34d399] shadow-[0_0_12px_rgba(16,185,129,0.45)]"
              style={{ width: barWidth }}
            />
            <motion.div
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: '-200%' }}
              animate={{ x: '400%' }}
              transition={{ duration: 1.15, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>

        <div className="mt-6 flex min-h-[1.5rem] items-center justify-center">
          <span aria-live="polite" className="font-display text-sm sm:text-base font-semibold tabular-nums text-[#34d399]">
            {percent}%
          </span>
        </div>
      </div>

      <span className="absolute bottom-8 text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)] z-10">
        {t('splash.skip')}
      </span>
    </motion.div>
  );
};
