import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useDeviceTier } from './useDeviceTier';

/**
 * Global smooth scroll with light damping. Anchor links (`#work`, `#voice`, …)
 * are routed through Lenis manually so section navigation gets the same
 * weightless easing (and an offset that clears the floating nav).
 *
 * Low-tier devices skip Lenis entirely — the rAF loop and virtual-scroll
 * transforms add jank on weak CPUs, and native scroll is smoother there
 * (native anchor jumps land on `scroll-margin-top` in index.css). Medium
 * devices keep Lenis with a lighter easing duration.
 *
 * Returns a ref to the live Lenis instance (or null before mount / on low
 * tier) so callers — e.g. App.tsx — can stop/start it while a modal is open.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const tier = useDeviceTier();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (tier === 'low') return; // native scroll, no virtual-scroll overhead
    // Mobile (<md) runs the slideshow — sections are isolated 100dvh slides
    // with native scroll, no page scrolling to smooth.
    if (!window.matchMedia('(min-width: 48rem)').matches) return;

    // Section navigation lands faster on touch devices — 1.2s of eased travel
    // feels heavy when you're swiping; native touch scroll is untouched (Lenis
    // only smooths wheel input), so this just tunes the anchor ride.
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const ride = tier === 'medium' ? 0.95 : 1.2;

    const lenis = new Lenis({
      duration: ride,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoRaf: true,
    });
    lenisRef.current = lenis;

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, {
        offset: -80,
        duration: isCoarse ? 0.85 : ride,
      });
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [tier]);

  return lenisRef;
}

