import { createContext, useContext, useRef, useEffect, useCallback, useMemo } from 'react';
import { MotionValue, motionValue, clamp } from 'framer-motion';
import type Lenis from 'lenis';
import type { SectionId } from './assetRegistry';

/**
 * Centralized motion store — the single source of scroll-driven values.
 *
 * Every frame, Lenis updates raw values. Both DOM (via useScrollState / RAF loops)
 * and Three.js (via useFrame reading the same MotionValues) consume from this store.
 *
 * No React state updates per frame — MotionValues are ref-backed and drive
 * transforms without causing re-renders.
 *
 * Damped velocity uses exponential smoothing for spring-like inertia without
 * the overhead of Framer Motion's useSpring (which would cause re-renders).
 */
export interface MotionStore {
  /** 0–1 progress of entire page scroll. */
  scrollProgress: MotionValue<number>;
  /** Signed velocity px/frame — positive = down. */
  scrollVelocity: MotionValue<number>;
  /** -1 up, 0 idle, 1 down. */
  scrollDirection: MotionValue<number>;
  /** Currently visible section id. */
  currentSection: MotionValue<SectionId>;
  /** 0–1 progress within current section. */
  sectionProgress: MotionValue<number>;
  /** 0–1 during section transition, 0 otherwise. */
  transitionProgress: MotionValue<number>;
  /** 0–1 motion intensity derived from velocity. */
  motionIntensity: MotionValue<number>;
  /** Damped velocity for spring-like inertia (exponential smoothing). */
  dampedVelocity: MotionValue<number>;

  /** Raw scroll Y in pixels (for Three.js useFrame). */
  rawScrollY: MotionValue<number>;
  /** Document height in pixels. */
  docHeight: MotionValue<number>;

  /** Subscribe to scroll updates. Returns unsubscribe function. */
  onUpdate: (callback: () => void) => () => void;

  /** Lock/unlock page scroll (overlays). No-op without Lenis (low tier/mobile). */
  lenisControl: (stop: boolean) => void;
}

const MotionStoreContext = createContext<MotionStore | null>(null);

export function useMotionStore(): MotionStore {
  const store = useContext(MotionStoreContext);
  if (!store) throw new Error('useMotionStore must be used within MotionStoreProvider');
  return store;
}

/**
 * Convenience hook that returns the same shape as the old ScrollState —
 * plain numbers read from MotionValues. For components that don't need
 * per-frame reactivity and just read once per render.
 */
export function useScrollState() {
  const store = useMotionStore();
  return {
    scrollProgress: store.scrollProgress.get(),
    scrollVelocity: store.scrollVelocity.get(),
    scrollDirection: store.scrollDirection.get() as -1 | 0 | 1,
    currentSection: store.currentSection.get(),
    sectionProgress: store.sectionProgress.get(),
    transitionProgress: store.transitionProgress.get(),
    motionIntensity: store.motionIntensity.get(),
    dampedVelocity: store.dampedVelocity.get(),
  };
}

// ── Section measurement ──────────────────────────────────────────────
interface SectionBounds {
  id: SectionId;
  top: number;
  bottom: number;
  height: number;
}

function measureSections(): SectionBounds[] {
  const entries: SectionBounds[] = [];
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => {
    const id = el.dataset.section as SectionId;
    if (!id) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const bottom = rect.bottom + window.scrollY;
    entries.push({ id, top, bottom, height: bottom - top });
  });
  entries.sort((a, b) => a.top - b.top);
  return entries;
}

// ── Easing helpers ───────────────────────────────────────────────────
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ── Provider ─────────────────────────────────────────────────────────
interface MotionStoreProviderProps {
  lenisRef: React.RefObject<Lenis | null>;
  children: React.ReactNode;
}

export function MotionStoreProvider({ lenisRef, children }: MotionStoreProviderProps) {
  const providerLenisRef = lenisRef;

  // Create MotionValues once
  const store = useMemo<MotionStore>(() => {
    const mv = <T extends number | string>(initial: T) => motionValue(initial) as MotionValue<any>;

    // Simple callback registry for subscribers
    const listeners = new Set<() => void>();

    const onUpdate = (callback: () => void) => {
      listeners.add(callback);
      return () => { listeners.delete(callback); };
    };

    const notify = () => { listeners.forEach((cb) => cb()); };

    const store: MotionStore = {
      scrollProgress: mv(0),
      scrollVelocity: mv(0),
      scrollDirection: mv(0),
      currentSection: mv('hero'),
      sectionProgress: mv(0),
      transitionProgress: mv(0),
      motionIntensity: mv(0),
      dampedVelocity: mv(0),
      rawScrollY: mv(0),
      docHeight: mv(0),
      onUpdate,
      lenisControl: (stop: boolean) => {
        const lenis = providerLenisRef.current;
        if (!lenis) return;
        if (stop) lenis.stop();
        else lenis.start();
      },
    };

    // Attach notify to the store for internal use
    (store as any)._notify = notify;

    return store;
  }, []);

  const sectionsRef = useRef<SectionBounds[]>([]);
  const dampedVelRef = useRef(0);

  // Measure sections on mount + resize
  const reMeasure = useCallback(() => {
    sectionsRef.current = measureSections();
  }, []);

  useEffect(() => {
    reMeasure();
    window.addEventListener('resize', reMeasure);
    const timer = setTimeout(reMeasure, 1000);
    return () => {
      window.removeEventListener('resize', reMeasure);
      clearTimeout(timer);
    };
  }, [reMeasure]);

  // Scroll source of truth: native window.scrollY. Lenis smooths the window
  // natively, so this captures wheel, keyboard, scrollbar, anchor AND
  // programmatic scrolls — anything that moves the page.
  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY;

    const compute = () => {
      ticking = false;

      const scrollY = window.scrollY;
      const docHeight = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const velocity = scrollY - lastY;
      lastY = scrollY;

      store.rawScrollY.set(scrollY);
      store.docHeight.set(docHeight);
      store.scrollProgress.set(docHeight > 0 ? clamp(scrollY / docHeight, 0, 1) : 0);
      store.scrollVelocity.set(velocity);

      // Direction: -1 up, 0 idle, 1 down
      const absVel = Math.abs(velocity);
      store.scrollDirection.set(absVel < 0.1 ? 0 : velocity > 0 ? 1 : -1);

      // Damped velocity — exponential smoothing for spring-like inertia
      dampedVelRef.current = dampedVelRef.current * 0.85 + velocity * 0.15;
      store.dampedVelocity.set(dampedVelRef.current);

      // Motion intensity: 0–1 based on velocity magnitude, eased for natural feel
      const rawIntensity = clamp(absVel / 12, 0, 1);
      const easedIntensity = easeOutExpo(rawIntensity);
      store.motionIntensity.set(easedIntensity);

      // Find current section
      const sections = sectionsRef.current;
      let currentIdx = 0;
      let sectionProgress = 0;
      let transitionProgress = 0;

      if (sections.length > 0) {
        for (let i = sections.length - 1; i >= 0; i--) {
          if (scrollY >= sections[i].top - window.innerHeight * 0.4) {
            currentIdx = i;
            const sec = sections[i];
            sectionProgress = sec.height > 0
              ? clamp((scrollY - sec.top) / sec.height, 0, 1)
              : 0;

            // Transition zones at section boundaries — smooth crossfade
            const zone = window.innerHeight * 0.15;
            for (let j = Math.max(0, i - 1); j <= Math.min(sections.length - 1, i + 1); j++) {
              if (j === i) continue;
              const boundary = j < i ? sections[i].top : sections[i].bottom;
              const dist = Math.abs(scrollY - boundary);
              if (dist < zone) {
                const raw = 1 - dist / zone;
                transitionProgress = Math.max(transitionProgress, easeInOutCubic(raw));
              }
            }
            break;
          }
        }
      }

      store.currentSection.set((sections[currentIdx]?.id as SectionId) ?? 'hero');
      store.sectionProgress.set(sectionProgress);
      store.transitionProgress.set(clamp(transitionProgress, 0, 1));

      // Notify subscribers (VideoLayers etc.)
      (store as any)._notify?.();
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    compute();
    return () => { window.removeEventListener('scroll', onScroll); };
  }, [store]);

  return (
    <MotionStoreContext.Provider value={store}>
      {children}
    </MotionStoreContext.Provider>
  );
}
