import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ease } from '../lib/motionTokens';

/**
 * Custom cursor accent — emerald ring trailing the pointer, expanding over
 * interactive elements (`a`, `button`, `[data-cursor="card"]`), fading over
 * text fields. Fine pointers only; native cursor stays visible.
 */
export const CustomCursor = React.memo(function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      if (!el) return;
      setHidden(Boolean(el.closest('input, textarea, select')));
      setActive(
        Boolean(
          el.closest('a, button, [data-cursor="card"], [role="button"]')
        )
      );
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none" aria-hidden="true">
      {/* Trailing ring */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="absolute top-0 left-0 -ml-4 -mt-4 h-8 w-8 rounded-full border border-accent/50"
        animate={{ scale: active ? 1.9 : 1, opacity: hidden ? 0 : 0.85 }}
        transition={{ duration: 0.25, ease: ease.cinematic }}
      />
      {/* Center dot */}
      <motion.div
        style={{ x, y }}
        className="absolute top-0 left-0 -ml-[2.5px] -mt-[2.5px] h-[5px] w-[5px] rounded-full bg-accent"
        animate={{ opacity: hidden ? 0 : 1 }}
      />
    </div>
  );
});
