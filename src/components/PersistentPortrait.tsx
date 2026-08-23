import React, { useRef, useEffect } from 'react';
import { useMotionStore } from '../lib/motionEngine';
import { PORTRAIT_SLOTS, type PortraitSlot } from '../lib/portrait/slots';

const TOTAL_FRAMES = 300;
const BATCH_SIZE = 20;
const LERP = 0.08;

function frameUrl(index: number): string {
  return `/portrait-cutout/frame-${String(index + 1).padStart(3, '0')}.png`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * The Presence — scroll-choreographed portrait.
 *
 * Canvas frame-player (300 frames) whose wrapper docks into a per-section
 * layout slot (position/scale/opacity/blend from PORTRAIT_SLOTS). Slot values
 * are interpolated every frame directly on element styles — zero React state,
 * zero re-renders. Velocity adds a subtle drift so it breathes with the scroll.
 */
export const PersistentPortrait = React.memo(function PersistentPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const loadedRef = useRef<Set<number>>(new Set());
  const loadingRef = useRef<Set<number>>(new Set());
  const frameRef = useRef(0);
  const currentRef = useRef<PortraitSlot>({ ...PORTRAIT_SLOTS.hero });
  const batchStartRef = useRef(0);

  const store = useMotionStore();
  const storeRef = useRef(store);
  storeRef.current = store;

  const loadBatch = (upTo: number) => {
    const end = Math.min(TOTAL_FRAMES, upTo + BATCH_SIZE);
    for (let i = upTo; i < end; i++) {
      if (loadedRef.current.has(i) || loadingRef.current.has(i)) continue;
      loadingRef.current.add(i);
      const img = new Image();
      img.src = frameUrl(i);
      img.onload = () => {
        loadedRef.current.add(i);
        loadingRef.current.delete(i);
        imagesRef.current.set(i, img);
      };
    }
  };

  // Frame index tracks page progress via MotionStore subscription (no re-render)
  useEffect(() => {
    return store.onUpdate(() => {
      const progress = store.scrollProgress.get();
      frameRef.current = Math.round(progress * (TOTAL_FRAMES - 1));
      const batchStart = Math.floor(frameRef.current / BATCH_SIZE) * BATCH_SIZE;
      if (batchStart !== batchStartRef.current) {
        batchStartRef.current = batchStart;
        loadBatch(batchStart);
      }
    });
  }, [store]);

  useEffect(() => {
    loadBatch(0);

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse =
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    let raf: number;

    const tick = () => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;

      if (canvas && wrap) {
        // ── Frame blit ──
        const ctx = canvas.getContext('2d');
        const img = imagesRef.current.get(frameRef.current);
        if (ctx && img && img.complete && img.naturalWidth > 0) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          if (canvas.width !== vw || canvas.height !== vh) {
            canvas.width = vw;
            canvas.height = vh;
          }
          const NAV_H = 120;
          const SHRINK = 0.78;
          const baseScale = Math.max(vw / img.naturalWidth, vh / img.naturalHeight) * SHRINK;
          const drawW = img.naturalWidth * baseScale;
          const drawH = img.naturalHeight * baseScale;
          ctx.clearRect(0, 0, vw, vh);
          ctx.drawImage(img, (vw - drawW) / 2, NAV_H + (vh - NAV_H - drawH) / 2, drawW, drawH);
        }

        // ── Slot docking ──
        const section = storeRef.current.currentSection.get();
        const target = PORTRAIT_SLOTS[section] ?? PORTRAIT_SLOTS.hero;
        const cur = currentRef.current;
        const k = reduceMotion || isCoarse ? 1 : LERP;

        // Velocity drift — portrait leans against scroll direction
        const vel = storeRef.current.dampedVelocity.get();
        const drift = Math.max(-8, Math.min(8, -vel * 0.6));

        cur.x = lerp(cur.x, target.x + drift, k);
        cur.y = lerp(cur.y, target.y, k);
        cur.scale = lerp(cur.scale, target.scale, k);
        cur.opacity = lerp(cur.opacity, target.opacity, k);

        wrap.style.transform = `translate(calc(-50% + ${cur.x}vw), calc(-50% + ${cur.y}vh)) scale(${cur.scale})`;
        wrap.style.opacity = String(reduceMotion ? Math.max(cur.opacity, 0.9) : cur.opacity);
        wrap.style.mixBlendMode = target.blend;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed top-1/2 left-1/2 z-[2] pointer-events-none will-change-transform"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
});
