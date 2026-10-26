import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Blur-clear + deeper slide for cinematic moments */
  cinematic?: boolean;
}

/**
 * Scroll-reveal wrapper. IntersectionObserver (not scroll listeners) drives a
 * one-shot CSS transition: translate + opacity + optional blur-clear.
 * Honors prefers-reduced-motion by rendering the final state immediately.
 */
export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0, cinematic }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
        visible
          ? 'opacity-100 translate-y-0 blur-0'
          : cinematic
            ? 'opacity-0 translate-y-16 blur-md'
            : 'opacity-0 translate-y-10',
        className
      )}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};
