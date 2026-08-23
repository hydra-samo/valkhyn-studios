import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCoarsePointer } from '../../hooks/useCoarsePointer';

gsap.registerPlugin(ScrollTrigger);

interface Step {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  deliverable: string;
}

/**
 * Pinned Process scene — the viewport pins while each step swaps through:
 * number scales huge, title/description crossfade. Desktop + fine pointer +
 * motion allowed only; callers fall back to the editorial stacked list.
 */
export const PinnedSteps = React.memo(function PinnedSteps({ steps }: { steps: Step[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const isCoarse = useCoarsePointer();

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const enabled = !reduceMotion && !isCoarse;

  useEffect(() => {
    if (!enabled || !wrapRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.process-panel', stageRef.current!);
      if (!panels.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current!,
          start: 'top top',
          end: () => `+=${panels.length * 90}%`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      panels.forEach((panel, i) => {
        const num = panel.querySelector('.process-num');
        const body = panel.querySelectorAll('.process-body');
        if (i > 0) {
          tl.fromTo(
            panel,
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: 'power2.out' },
            i
          );
        }
        if (num) {
          tl.fromTo(
            num,
            { scale: 0.6, opacity: 0.4 },
            { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
            i
          );
        }
        tl.fromTo(
          body,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out' },
          i + 0.15
        );
        if (i < panels.length - 1) {
          tl.to(panel, { opacity: 0, y: -50, duration: 0.8, ease: 'power2.in' }, i + 0.9);
        }
      });
    }, wrapRef);

    return () => ctx.revert();
  }, [enabled, steps.length]);

  return (
    <div ref={wrapRef} className={enabled ? 'relative h-screen overflow-hidden' : 'flex flex-col'}>
      {/* Ghost backdrop number rail */}
      <div
        ref={stageRef}
        className={enabled ? 'absolute inset-0' : 'contents'}
      >
        {steps.map((step) => (
          <div
            key={step.number}
            className={`process-panel ${
              enabled
                ? 'absolute inset-0 flex flex-col justify-center px-[8vw]'
                : 'relative py-10 sm:py-14'
            }`}
          >
            <div className="grid grid-cols-12 gap-4 sm:gap-6 items-start">
              <div className="col-span-12 sm:col-span-5">
                <span
                  className={`process-num block font-mono font-medium tracking-wider text-accent ${
                    enabled ? 'text-[18vw] leading-none heading-cinematic' : 'text-sm'
                  }`}
                >
                  {step.number}
                </span>
                <div className="process-body mt-4">
                  <span className="block text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium mb-2">
                    {step.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight uppercase text-white leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>

              <div className="col-span-12 sm:col-span-6 sm:col-start-7">
                <p className="process-body text-sm sm:text-lg text-white/45 leading-relaxed">
                  {step.description}
                </p>
                <p className="process-body text-[11px] sm:text-xs text-white/20 uppercase tracking-widest mt-4 font-medium">
                  {step.deliverable}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
