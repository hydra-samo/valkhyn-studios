import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useDeviceTier } from './useDeviceTier';

/**
 * Global smooth scroll for fine-pointer desktop wheels only.
 *
 * Phones and tablets keep native touch scrolling: eased wheel tweening on a
 * swipe viewport makes the page keep travelling after the finger stops, which
 * reads as a two-line bounce. Narrow viewports skip Lenis for the same reason.
 * Anchor links are routed through Lenis on desktop so they get the same eased
 * travel with an offset that clears the fixed nav; on touch they use the
 * native jump with `scroll-margin-top` from index.css.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const tier = useDeviceTier();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (tier === 'low') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;

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
      lenis.scrollTo(target as HTMLElement, { offset: -88, duration: ride });
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
