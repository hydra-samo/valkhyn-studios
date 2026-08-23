import React, { useEffect, useRef } from 'react';
import type * as ThreeNS from 'three';

/**
 * HydraField — the hero WebGL signature. A drifting emerald particle field
 * that leans toward the pointer and churns with scroll velocity.
 *
 * Three.js is imported dynamically inside the effect so it lands in its own
 * lazy chunk. The field pauses when the hero scrolls out of view and never
 * mounts on reduced-motion / coarse-pointer devices (caller gates by tier).
 */
export const HydraField = React.memo(function HydraField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import('three').then((THREE) => {
      if (disposed || !hostRef.current) return;

      const host = hostRef.current;
      const COUNT = 1400;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, host.clientWidth / host.clientHeight, 0.1, 100);
      camera.position.z = 14;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(host.clientWidth, host.clientHeight);
      host.appendChild(renderer.domElement);

      // ── Particle field ──
      const positions = new Float32Array(COUNT * 3);
      const seeds = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        seeds[i] = Math.random();
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color: new THREE.Color('#00A86B'),
        size: 0.055,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      // ── Interaction state ──
      const target = { x: 0, y: 0 };
      const cur = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        target.x = (e.clientX / window.innerWidth - 0.5) * 2;
        target.y = -(e.clientY / window.innerHeight - 0.5) * 2;
      };

      let visible = true;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      }, { threshold: 0.05 });
      io.observe(host);

      let vel = 0;
      let lastScroll = window.scrollY;
      const onScroll = () => {
        vel = vel * 0.85 + (window.scrollY - lastScroll) * 0.15;
        lastScroll = window.scrollY;
      };

      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });

      const onResize = () => {
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(host.clientWidth, host.clientHeight);
      };
      window.addEventListener('resize', onResize);

      const posAttr = geo.getAttribute('position') as ThreeNS.BufferAttribute;
      let raf = 0;
      let t = 0;

      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible) return;

        t += 0.005;
        cur.x += (target.x - cur.x) * 0.04;
        cur.y += (target.y - cur.y) * 0.04;

        const churn = Math.min(Math.abs(vel) / 30, 1);
        for (let i = 0; i < COUNT; i++) {
          const ix = i * 3;
          const s = seeds[i];
          posAttr.array[ix] += Math.sin(t + s * 6.28) * 0.002 + cur.x * 0.0015;
          posAttr.array[ix + 1] += Math.cos(t * 0.8 + s * 6.28) * 0.002 + churn * 0.02 * ((s - 0.5) > 0 ? 1 : -1);
          posAttr.array[ix + 2] += cur.y * 0.0008;
        }
        posAttr.needsUpdate = true;

        points.rotation.y = cur.x * 0.12;
        points.rotation.x = -cur.y * 0.08;
        mat.opacity = 0.45 + churn * 0.25;

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        host.removeChild(renderer.domElement);
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      aria-hidden="true"
    />
  );
});
