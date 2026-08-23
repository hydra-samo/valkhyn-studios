import React, { useRef, useEffect } from 'react';
import { useScrollFrame } from '../contexts/ScrollContext';

const TOTAL_FRAMES = 300;
const BATCH_SIZE = 20;

function frameUrl(index: number): string {
  return `/portrait-cutout/frame-${String(index + 1).padStart(3, '0')}.png`;
}

export const PersistentPortrait = React.memo(function PersistentPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const loadedRef = useRef<Set<number>>(new Set());
  const loadingRef = useRef<Set<number>>(new Set());
  const frameRef = useRef(0);
  const { frame } = useScrollFrame();

  frameRef.current = frame;

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

  useEffect(() => {
    let raf: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) { raf = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { raf = requestAnimationFrame(draw); return; }

      const idx = frameRef.current;
      const img = imagesRef.current.get(idx);

      if (!img || !img.complete || img.naturalWidth === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw;
        canvas.height = vh;
      }

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const NAV_H = 120;
      const SHRINK = 0.78;
      const baseScale = Math.max(vw / imgW, vh / imgH) * SHRINK;
      const drawW = imgW * baseScale;
      const drawH = imgH * baseScale;

      const offsetX = (vw - drawW) / 2;
      const offsetY = NAV_H + (vh - NAV_H - drawH) / 2;

      ctx.clearRect(0, 0, vw, vh);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const batchStart = Math.floor(frame / BATCH_SIZE) * BATCH_SIZE;
    loadBatch(batchStart);
  }, [frame]);

  useEffect(() => {
    loadBatch(0);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[2] pointer-events-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
});
