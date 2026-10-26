import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { cn } from '../lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  href?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

/**
 * Magnetic CTA: the button (and its inner label) pull toward the cursor with
 * GSAP quickTo, then spring back. Reduced-motion and coarse pointers get a
 * plain button. Glass surface only — brand rule: no flat bright CTA fills.
 */
export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className,
  strength = 0.3,
  href,
  onClick,
  'aria-label': ariaLabel,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const ixTo = gsap.quickTo(inner.current, 'x', { duration: 0.8, ease: 'power3.out' });
    const iyTo = gsap.quickTo(inner.current, 'y', { duration: 0.8, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      xTo(dx);
      yTo(dy);
      ixTo(dx * 0.4);
      iyTo(dy * 0.4);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
      ixTo(0);
      iyTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  const Tag = href ? 'a' : 'button';

  return (
    <div ref={ref} className="inline-block will-change-transform">
      <Tag
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(
          'cta-glass group relative inline-flex items-center gap-3 rounded-full px-6 py-3',
          'text-[11px] font-semibold uppercase tracking-[0.18em]',
          className
        )}
      >
        <span ref={inner} className="inline-flex items-center gap-2.5 will-change-transform">
          {children}
        </span>
      </Tag>
    </div>
  );
};
