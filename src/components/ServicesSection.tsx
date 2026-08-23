import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CinematicSection } from './motion/CinematicSection';
import { Reveal } from './motion/Reveal';
import { PinnedSteps } from './process/PinnedSteps';
import { useLanguage } from '../i18n/LanguageContext';
import { PROCESS_STEPS as STEPS, COMPARISON_MATRIX as COMPARISON } from '../data/portfolioData';
import { localizeProcessSteps, localizeComparison } from '../i18n/translations';
import { ease, duration, stagger } from '../lib/motionTokens';
import { useCoarsePointer } from '../hooks/useCoarsePointer';

/**
 * Process / Services — editorial manifesto layout.
 * Numbered vertical entries with strong typographic hierarchy,
 * thin dividers, generous whitespace, and no cards/grids.
 */
export const ServicesSection = React.memo(function ServicesSection() {
  const { t, lang } = useLanguage();
  const steps = localizeProcessSteps(STEPS, lang);
  const comparison = localizeComparison(COMPARISON, lang);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const isCoarse = useCoarsePointer();
  const pinEnabled = !reduceMotion && !isCoarse;

  return (
    <CinematicSection
      id="services"
      data-section="services"
      data-atmosphere-theme="process"
      className="relative py-24 sm:py-32 md:py-44 px-5 sm:px-8 lg:px-12 overflow-hidden"
    >
      {/* Atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-accent/[0.04] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl relative z-10">
        {/* ── Section Header ──────────────────────────────────────────────── */}
        <Reveal className="mb-16 sm:mb-24" cinematic>
          <span className="label-cinematic block mb-4">{t('process.how')}</span>
          <h2 className="heading-cinematic text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white">
            {t('process.how')}{' '}
            <span className="text-accent">{t('process.operates')}</span>
          </h2>
          <p className="max-w-2xl text-base sm:text-lg text-white/45 font-normal leading-relaxed mt-6">
            {t('process.intro')}
          </p>
        </Reveal>

        {/* ── Editorial Numbered Entries ──────────────────────────────────── */}
        {pinEnabled ? (
          <PinnedSteps steps={steps} />
        ) : (
        <div className="flex flex-col">
          {steps.map((step, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <Reveal key={step.number} delay={idx * stagger.item} cinematic>
                {/* Entry */}
                <div
                  className="group relative py-10 sm:py-14 md:py-18"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div className="grid grid-cols-12 gap-4 sm:gap-6 items-start">
                    {/* Number — fixed axis */}
                    <div className="col-span-2 sm:col-span-1">
                      <motion.span
                        className="block text-sm sm:text-base font-mono font-medium tracking-wider"
                        animate={{
                          color: isHovered ? '#00FF9C' : '#00A86B',
                        }}
                        transition={{ duration: duration.quick, ease: ease.cinematic }}
                      >
                        {step.number}
                      </motion.span>
                    </div>

                    {/* Title + Description — editorial column */}
                    <div className="col-span-10 sm:col-span-5 md:col-span-4">
                      <span className="block text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium mb-2 sm:mb-3">
                        {step.subtitle}
                      </span>
                      <motion.h3
                        className="text-lg sm:text-xl md:text-2xl font-display font-bold tracking-[-0.02em] uppercase text-white leading-tight"
                        animate={{
                          x: isHovered ? 4 : 0,
                          color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.9)',
                        }}
                        transition={{ duration: duration.quick, ease: ease.cinematic }}
                      >
                        {step.title}
                      </motion.h3>
                    </div>

                    {/* Description — wider editorial paragraph */}
                    <div className="col-span-12 sm:col-span-6 md:col-span-5 md:col-start-7">
                      <p className="text-sm sm:text-[15px] text-white/40 leading-relaxed font-normal">
                        {step.description}
                      </p>
                      <p className="text-[11px] sm:text-xs text-white/20 uppercase tracking-widest mt-4 font-medium">
                        {step.deliverable}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider — thin emerald line */}
                <motion.div
                  className="relative h-px overflow-hidden"
                  aria-hidden="true"
                >
                  <motion.div
                    className="absolute inset-0 origin-left"
                    animate={{
                      scaleX: isHovered ? 1 : 0.6,
                      opacity: isHovered ? 1 : 0.3,
                    }}
                    transition={{ duration: duration.mid, ease: ease.cinematic }}
                    style={{ backgroundColor: '#063C2C' }}
                  />
                </motion.div>
              </Reveal>
            );
          })}
        </div>
        )}

        {/* ── Comparison — Editorial Manifesto ────────────────────────────── */}
        <div className="mt-20 sm:mt-28">
          <Reveal cinematic>
            <h3 className="heading-cinematic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-4">
              {t('process.narrativeTitle')}{' '}
              <span className="text-accent">{t('process.narrativeTitleGrad')}</span>
            </h3>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-10">
            {/* Fragmented */}
            <Reveal cinematic className="py-8 md:py-10 md:pr-10 md:border-r border-white/[0.04]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium block mb-3">
                {t('process.fragmentedTitle')}
              </span>
              <p className="text-sm text-white/35 leading-relaxed mb-6">
                {t('process.fragmentedDesc')}
              </p>
              <ul className="space-y-3">
                {comparison.map((row) => (
                  <li key={row.feature} className="text-sm text-white/25 leading-relaxed">
                    {row.agency}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Unified */}
            <Reveal delay={0.1} cinematic className="py-8 md:py-10 md:pl-10">
              <span className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-medium block mb-3">
                {t('process.unifiedTitle')}
              </span>
              <p className="text-sm text-white/45 leading-relaxed mb-6">
                {t('process.unifiedDesc')}
              </p>
              <ul className="space-y-3">
                {comparison.map((row) => (
                  <li key={row.feature} className="text-sm text-white/60 leading-relaxed">
                    {row.hydra}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </CinematicSection>
  );
});
