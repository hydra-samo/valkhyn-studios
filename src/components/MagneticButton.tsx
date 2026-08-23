import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '../lib/utils';
import { useCoarsePointer } from '../hooks/useCoarsePointer';
import { useDeviceTier } from '../hooks/useDeviceTier';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
}

/**
 * A button that gently pulls toward the cursor while hovered (and springs back
 * on leave). Used on primary CTAs to make the interface feel tactile.
 *
 * On touch devices (coarse pointer) the pull is disabled — there is no cursor
 * to track — and the button behaves as a plain tap target. Low-tier devices
 * skip the spring physics the same way, so the button is always static there.
 */
export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className,
  strength = 0.35,
  onClick,
  type = 'button',
  disabled = false,
  title,
  'aria-label': ariaLabel,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const isCoarse = useCoarsePointer();
  const isLowTier = useDeviceTier() === 'low';
  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.7 });
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.7 });

  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isCoarse || isLowTier) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    if (isCoarse || isLowTier) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
      title={title}
      aria-label={ariaLabel}
      style={isLowTier ? undefined : { x, y }}
      className={cn(isLowTier ? undefined : 'transform-gpu will-change-transform', className)}
    >
      {children}
    </motion.button>
  );
};
