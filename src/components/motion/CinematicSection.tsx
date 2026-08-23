import React, { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ease } from '../../lib/motionTokens';

interface CinematicSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  'data-section'?: string;
  'data-atmosphere-theme'?: string;
}

/**
 * Scroll-synced section wrapper.
 * Content fades/slides in cinematically as the section enters the viewport,
 * perfectly aligned with portrait frame progression.
 */
export function CinematicSection({
  children,
  className,
  id,
  'data-section': dataSection,
  'data-atmosphere-theme': dataAtmosphere,
}: CinematicSectionProps) {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.97, 1, 1, 0.98]);

  return (
    <section
      ref={ref}
      id={id}
      data-section={dataSection}
      data-atmosphere-theme={dataAtmosphere}
      className={className}
    >
      <motion.div
        style={{ opacity, y, scale }}
        transition={{ ease: ease.cinematic }}
        className="h-full"
      >
        {children}
      </motion.div>
    </section>
  );
}
