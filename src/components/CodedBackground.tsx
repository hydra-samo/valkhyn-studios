import React, { useEffect, useRef } from 'react';
import { useDeviceTier } from '../hooks/useDeviceTier';

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  weight: number;
  tint: number;
}

/**
 * CodedBackground — the site's continuous motion layer.
 *
 * Everything is drawn: no image, no video. A single fixed canvas renders three
 * stacked systems: an aurora of drifting radial gradients, particles tracing a
 * sine flow field (faded each frame so they accumulate into silk trails), and
 * slow upward dust.
 *
 * Reduced-motion users get one static frame, the loop pauses on a hidden tab,
 * and particle count / dust / DPR / aurora blobs all step down with the device
 * tier (`useDeviceTier`).
 */
export const CodedBackground: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const tier = useDeviceTier();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const low = tier === 'low';
    const mid = tier === 'medium';

    let w = 0;
    let h = 0;
    let dpr = 1;
    let parked = false;

    const particles: Particle[] = [];
    const dust: { x: number; y: number; r: number; s: number; a: number }[] = [];

    const spawn = (p?: Particle): Particle => {
      const t = p ?? ({} as Particle);
      t.x = Math.random() * w;
      t.y = Math.random() * h;
      t.px = t.x;
      t.py = t.y;
      t.vx = 0;
      t.vy = 0;
      t.maxLife = 220 + Math.random() * 320;
      t.life = Math.random() * t.maxLife;
      t.weight = 0.35 + Math.random() * 1.1;
      t.tint = Math.random();
      return t;
    };

    const build = () => {
      const area = w * h;
      const max = low ? 90 : mid ? 170 : 260;
      const min = low ? 40 : mid ? 70 : 90;
      const divisor = low ? 16000 : mid ? 9500 : 7000;
      const count = Math.round(Math.min(max, Math.max(min, area / divisor)));
      particles.length = 0;
      for (let i = 0; i < count; i++) particles.push(spawn());

      dust.length = 0;
      const dustCount = low ? 24 : mid ? 45 : 70;
      for (let i = 0; i < dustCount; i++) {
        dust.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.4 + Math.random() * 1.1,
          s: 0.08 + Math.random() * 0.22,
          a: 0.12 + Math.random() * 0.3,
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, low ? 1 : mid ? 1.25 : 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#060c09';
      ctx.fillRect(0, 0, w, h);
      build();
    };

    /** Layered sine field — smooth, loopable, no noise tables to ship. */
    const angle = (x: number, y: number, t: number) =>
      Math.sin(x * 0.0016 + t * 0.26) * 1.6 +
      Math.cos(y * 0.0021 - t * 0.19) * 1.5 +
      Math.sin((x + y) * 0.0009 + t * 0.11) * 0.9;

    const aurora = (t: number) => {
      ctx.globalCompositeOperation = 'lighter';
      const blobs =
        low
          ? [{ cx: w * 0.55, cy: h * 0.45, r: h * 0.62 }]
          : mid
            ? [
                { cx: w * (0.5 + Math.sin(t * 0.09) * 0.18), cy: h * (0.46 + Math.cos(t * 0.07) * 0.12), r: h * 0.6 },
                { cx: w * (0.78 + Math.cos(t * 0.06) * 0.1), cy: h * (0.35 + Math.sin(t * 0.08) * 0.08), r: h * 0.38 },
              ]
            : [
                { cx: w * (0.5 + Math.sin(t * 0.09) * 0.18), cy: h * (0.46 + Math.cos(t * 0.07) * 0.12), r: h * 0.6 },
                { cx: w * (0.22 + Math.cos(t * 0.06) * 0.1), cy: h * (0.72 + Math.sin(t * 0.08) * 0.08), r: h * 0.42 },
                { cx: w * (0.82 + Math.sin(t * 0.11) * 0.08), cy: h * (0.3 + Math.cos(t * 0.05) * 0.1), r: h * 0.34 },
              ];

      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, b.r);
        g.addColorStop(0, 'rgba(16,185,129,0.014)');
        g.addColorStop(0.55, 'rgba(5,150,105,0.006)');
        g.addColorStop(1, 'rgba(6,12,9,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (time: number) => {
      const t = time * 0.001;

      // Fade instead of clear: this is what turns moving points into silk.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(6,12,9,0.11)';
      ctx.fillRect(0, 0, w, h);

      aurora(t);

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (const p of particles) {
        const a = angle(p.x, p.y, t);
        const speed = 0.42 + p.weight * 0.2;
        p.vx += Math.cos(a) * speed * 0.055;
        p.vy += Math.sin(a) * speed * 0.055;

        // Soft cursor vortex
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (pointer.active && d2 < 34000 && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / 184) * 0.75;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        p.vx *= 0.955;
        p.vy *= 0.955;
        p.x += p.vx * 1.7;
        p.y += p.vy * 1.7;
        p.life -= 1;

        if (p.life <= 0 || p.x < -60 || p.x > w + 60 || p.y < -60 || p.y > h + 60) {
          spawn(p);
          continue;
        }

        // Two emerald families instead of one flat color.
        ctx.strokeStyle =
          p.tint > 0.72
            ? `rgba(52,211,153,${0.014 * p.weight})`
            : `rgba(16,185,129,${0.02 * p.weight})`;
        ctx.lineWidth = p.weight * 0.85;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        p.px = p.x;
        p.py = p.y;
      }

      for (const d of dust) {
        d.y -= d.s;
        d.x += Math.sin((d.y + t * 40) * 0.004) * 0.25;
        if (d.y < -10) {
          d.y = h + 10;
          d.x = Math.random() * w;
        }
        ctx.fillStyle = `rgba(52,211,153,${d.a * 0.55})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced && !parked) rafRef.current = requestAnimationFrame(step);
    };

    const pointer = { x: -9999, y: -9999, active: false };

    // Static frame for reduced motion: one aurora pass + a handful of strokes.
    const still = () => {
      ctx.fillStyle = '#060c09';
      ctx.fillRect(0, 0, w, h);
      aurora(12);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        const a = angle(p.x, p.y, 3);
        ctx.strokeStyle = 'rgba(16,185,129,0.05)';
        ctx.lineWidth = p.weight * 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(a) * 26, p.y + Math.sin(a) * 26);
        ctx.stroke();
      }
    };

    resize();
    if (reduced) {
      still();
    } else {
      rafRef.current = requestAnimationFrame(step);
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduced) still();
      }, 160);
    };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVis = () => {
      if (document.hidden) {
        parked = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!reduced) {
        parked = false;
        if (!rafRef.current) rafRef.current = requestAnimationFrame(step);
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onLeave);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      parked = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [tier]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        contain: 'strict',
      }}
    />
  );
};
