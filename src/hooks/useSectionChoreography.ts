import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Scroll Choreography Hook
 *
 * Provides scroll-linked values for section content animation.
 * Simplified version that uses Framer Motion's useInView directly.
 */

interface SectionChoreography {
  /** Whether this section is currently in view */
  isInView: boolean;
  /** Whether the section has been scrolled past */
  hasScrolledPast: boolean;
}

export function useSectionChoreography(_sectionId: string): SectionChoreography {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });

  return {
    isInView,
    hasScrolledPast: false,
  };
}
