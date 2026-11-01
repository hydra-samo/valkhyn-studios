import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useDeviceTier } from './useDeviceTier';

/**
 * Global smooth scroll with light damping. Anchor links (`#work`, `#contact`, …)
 * are routed through Lenis manually so section navigation gets the same eased
 * travel with an offset that clears the fixed nav.
 *
 * Low-tier devices skip Lenis entirely — the rAF loop and virtual-scroll
 * transforms add jank on weak CPUs, and native scroll is smoother there
 * (`scroll-margin-top` in index.css keeps anchors clear of the nav).
 * Touch input is untouched either way: Lenis only smooths wheel scrolling.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const tier = useDeviceTier();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (tier === 'low') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // A shorter ride on touch: long eased travel feels heavy when swiping.
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
        offset: -88,
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
