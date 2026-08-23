import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicSection } from './motion/CinematicSection';
import { Reveal } from './motion/Reveal';
import { useLanguage } from '../i18n/LanguageContext';
import { PROJECTS } from '../data/projects';
import type { Project } from '../types';
import { HorizontalChapter } from './work/HorizontalChapter';
import { CaseTakeover } from './work/CaseTakeover';
import { ease, duration, stagger } from '../lib/motionTokens';

const FILTERS: { category: string; labelKey: string }[] = [
  { category: 'all', labelKey: 'work.cat.all' },
  { category: 'video', labelKey: 'work.cat.video' },
  { category: 'motion', labelKey: 'work.cat.motion' },
  { category: 'direction', labelKey: 'work.cat.direction' },
];

/**
 * Selected Works — pinned horizontal chapter of project cards opening into
 * full-screen case studies. Honest designed empty state until real work
 * exists (no fake content).
 */
export const ProjectsSection = React.memo(function ProjectsSection() {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = activeIdx === 0
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === FILTERS[activeIdx].category);

  const openProject: Project | undefined =
    openIdx !== null ? filtered[openIdx] : undefined;

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

          {PROJECTS.length > 0 && (
            <Reveal delay={stagger.item} cinematic>
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
          )}
        </div>

        {/* ── Chapter / Empty state ───────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: duration.base, ease: ease.cinematic }}
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
          <HorizontalChapter projects={filtered} onOpen={(p) => setOpenIdx(filtered.indexOf(p))} />
        )}

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
                    delay: i * stagger.item,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: 'bottom' }}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Case study takeover ───────────────────────────────────────────── */}
      <AnimatePresence>
        {openProject && (
          <CaseTakeover
            key={openProject.id}
            project={openProject}
            onClose={() => setOpenIdx(null)}
            onPrev={() => setOpenIdx((i) => ((i ?? 0) - 1 + filtered.length) % filtered.length)}
            onNext={() => setOpenIdx((i) => ((i ?? 0) + 1) % filtered.length)}
          />
        )}
      </AnimatePresence>
    </CinematicSection>
  );
});
