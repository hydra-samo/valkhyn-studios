import { useRef, useEffect, useState } from 'react';
import type { AssetConfig } from './assetRegistry';
import type { MotionStore } from './MotionStore';

interface VideoLayerProps {
  asset: AssetConfig;
  motionStore: MotionStore;
  affordable: boolean;
  /** Dashboard override — opacity multiplier + blend mode (atmosphere.json) */
  layerCfg?: { enabled?: boolean; opacity?: number; blend?: string };
}

/**
 * A single <video> layer — fixed, full-viewport, scroll-reactive opacity
 * via CSS transitions (no RAF). Parallax via CSS custom property driven
 * by MotionStore.
 *
 * Loop strategy:
 * - Ambient: seamless loop, staggered start offset
 * - Spatial/Signature: loop, playback rate tied to motion intensity
 */
export function VideoLayer({ asset, motionStore, affordable, layerCfg }: VideoLayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const wasPlayingRef = useRef(false);
  const initializedRef = useRef(false);

  const baseOpacity = asset.baseOpacity * (layerCfg?.opacity ?? 1);
  const blendMode = layerCfg?.blend ?? asset.blendMode;

  const isAmbient = asset.role.startsWith('environment') || asset.role === 'atmospheric_dust';
  const shouldLoop = isAmbient;

  // ── Lazy loading via IntersectionObserver ────────────────────────
  useEffect(() => {
    if (!asset.lazy || !affordable) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [asset.lazy, affordable]);

  const shouldShow = affordable && (asset.lazy ? loaded : true);

  // ── Playback control + staggered start ───────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !shouldShow) {
      video.pause();
      return;
    }

    // Stagger ambient videos so they don't all start at frame 0
    if (isAmbient && !initializedRef.current) {
      const maxTime = video.duration || 10;
      const hash = asset.id.charCodeAt(0) + asset.id.charCodeAt(asset.id.length - 1);
      video.currentTime = (hash / 255) * maxTime * 0.6;
      initializedRef.current = true;
    }

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {});
    }
  }, [shouldShow, isAmbient, asset.id]);

  // Pause when tab hidden, resume when visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onVisibility = () => {
      if (document.hidden) {
        wasPlayingRef.current = !video.paused;
        video.pause();
      } else if (wasPlayingRef.current && shouldShow) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [shouldShow]);

  // ── Scroll-driven updates via CSS custom properties ──────────────
  useEffect(() => {
    if (!shouldShow) return;

    const unsubscribe = motionStore.onUpdate(() => {
      if (!containerRef.current || !videoRef.current) return;

      const scrollProgress = motionStore.scrollProgress.get();
      const motionIntensity = motionStore.motionIntensity.get();
      const sectionProgress = motionStore.sectionProgress.get();
      const currentSection = motionStore.currentSection.get();

      // Opacity modulation
      const absIntensity = Math.abs(motionIntensity);
      const velBoost = Math.min(absIntensity * asset.velocityInfluence * 0.02, 0.15);

      let sectionBoost = 0;
      const inSection = asset.sections === null || asset.sections.includes(currentSection);
      if (inSection && asset.sections !== null) {
        sectionBoost = 0.06 + sectionProgress * 0.04;
      } else if (asset.sections !== null) {
        sectionBoost = -0.03;
      }

      const targetOpacity = Math.min(0.85, Math.max(0,
        baseOpacity + velBoost + sectionBoost
      ));

      containerRef.current.style.opacity = String(targetOpacity);

      // Parallax
      const parallaxOffset = scrollProgress * asset.parallaxSpeed * -80;
      containerRef.current.style.transform = `translateY(${parallaxOffset}px) scale(1.15)`;

      // Playback rate — ambient gets subtle modulation, spatial gets more
      if (isAmbient) {
        videoRef.current.playbackRate = 1 + motionIntensity * 0.15;
      } else {
        videoRef.current.playbackRate = 0.8 + motionIntensity * 0.8;
      }
    });

    return unsubscribe;
  }, [shouldShow, asset, motionStore, isAmbient]);

  // ── Reduced motion: hide entirely ────────────────────────────────
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !affordable) return null;

  return (
    <div
      ref={containerRef}
      className="hydra-motion-layer"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: asset.zIndex,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: baseOpacity,
        mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'],
        willChange: 'opacity, transform',
        contain: 'strict',
        transition: 'opacity 0.3s ease-out, transform 0.1s linear',
      }}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        loop={shouldLoop}
        muted
        playsInline
        preload={asset.lazy ? 'none' : 'auto'}
        className="hydra-motion-video"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        {shouldShow && <source src={asset.src} type="video/mp4" />}
      </video>
    </div>
  );
}
