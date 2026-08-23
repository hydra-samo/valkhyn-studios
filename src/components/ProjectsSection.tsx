import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicSection } from './motion/CinematicSection';
import { Reveal } from './motion/Reveal';
import { useLanguage } from '../i18n/LanguageContext';
import { PROJECTS } from '../data/portfolioData';

const FILTERS: { category: string; labelKey: string }[] = [
  { category: 'all', labelKey: 'work.cat.all' },
  { category: 'video', labelKey: 'work.cat.video' },
  { category: 'motion', labelKey: 'work.cat.motion' },
  { category: 'direction', labelKey: 'work.cat.direction' },
];

/**
 * Selected Works — editorial art-directed project showcase.
 * Oversized title, minimal filter bar, art-directed project cards.
 * Each card is a cinematic window into the project.
 */
export const ProjectsSection = React.memo(function ProjectsSection() {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);

  const filtered = activeIdx === 0
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === FILTERS[activeIdx].category);

  return (
    <CinematicSection
      id="work"
      data-section="work"
      data-atmosphere-theme="work"
      className="relative py-24 sm:py-32 md:py-44 px-5 sm:px-8 lg:px-12 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl relative z-10">
        {/* ── Section Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
          <Reveal cinematic>
            <span className="label-cinematic block mb-4">
              {t('work.selected')} {t('work.works')}
            </span>
            <h2 className="heading-cinematic text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white">
              {t('work.works')}
            </h2>
          </Reveal>

          <Reveal delay={0.15} cinematic>
            <div className="flex items-center gap-2">
              {FILTERS.map((filter, idx) => (
                <button
                  key={filter.category}
                  onClick={() => setActiveIdx(idx)}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeIdx === idx
                      ? 'bg-accent text-black'
                      : 'bg-accent/10 text-accent/60 hover:text-accent hover:bg-accent/20 border border-accent/20'
                  }`}
                >
                  {t(filter.labelKey)}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── Project Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="col-span-full"
              >
                <div className="relative aspect-[16/10] rounded-2xl border border-accent/[0.1] bg-accent/[0.02] overflow-hidden flex flex-col items-center justify-center gap-4 p-8">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-accent/20 flex items-center justify-center">
                    <span className="text-accent/30 text-xl">+</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-accent/30 font-semibold">
                    {t('work.emptyTitle')}
                  </span>
                  <p className="text-accent/20 text-xs text-center max-w-xs">
                    {t('work.emptyDesc')}
                  </p>
                </div>
              </motion.div>
            ) : (
              filtered.map((project, idx) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative aspect-[16/10] rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-accent/20 transition-all duration-500"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-accent/[0.06]" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <span className="text-[10px] uppercase tracking-widest text-accent/40 font-semibold mb-1">
                      {project.tag}
                    </span>
                    <h3 className="text-white text-sm font-bold">{project.title}</h3>
                    {project.client && (
                      <span className="text-[10px] text-white/30 mt-1">{project.client}</span>
                    )}
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/8 to-transparent pointer-events-none" />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── Voice-Over Sub-Section ──────────────────────────────────────── */}
        <div className="mt-20 sm:mt-28 border-t border-white/[0.04] pt-16">
          <Reveal cinematic>
            <h3 className="heading-cinematic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white text-center mb-4">
              {t('voice.headingProf')}{' '}
              <span className="text-accent">{t('voice.headingOver')}</span>
            </h3>
            <p className="text-sm sm:text-base text-white/40 text-center uppercase tracking-widest font-normal mb-8">
              {t('voice.comingSoon')}
            </p>
            {/* Breathing equalizer */}
            <div className="flex items-end justify-center gap-1.5 h-6" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className="eq-bar h-6"
                  initial={{ scaleY: 0.3 }}
                  whileInView={{ scaleY: [0.3, 1, 0.5, 0.8, 0.3] }}
                  viewport={{ once: false }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: 'bottom' }}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </CinematicSection>
  );
});
