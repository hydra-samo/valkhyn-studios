import { motion, type Variants } from "framer-motion";
import { ease, duration } from "../../lib/motionTokens";
import type { ReactNode } from "react";

function makeVariants(delay: number, cinematic = false): Variants {
  return {
    hidden: {
      opacity: 0,
      y: cinematic ? 40 : 24,
      filter: cinematic ? 'blur(8px)' : 'blur(0px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: cinematic ? duration.hero : duration.section,
        ease: ease.cinematic,
        delay,
      },
    },
  };
}

export function Reveal({
  children,
  delay = 0,
  className,
  cinematic = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Enable cinematic blur-clear + deeper slide */
  cinematic?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={makeVariants(delay, cinematic)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8% 0px" }}
    >
      {children}
    </motion.div>
  );
}
