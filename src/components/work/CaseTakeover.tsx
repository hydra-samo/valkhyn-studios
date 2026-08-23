import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project } from '../../types';
import { ease } from '../../lib/motionTokens';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMotionStore } from '../../lib/motionEngine';

interface CaseTakeoverProps {
  project: Project;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Full-screen case study takeover — video/poster stage plus the brief,
 * stack and deliverables. Locks page scroll; Esc closes.
 */
export const CaseTakeover: React.FC<CaseTakeoverProps> = ({
  project,
  onClose,
  onPrev,
  onNext,
}) => {
  const { t } = useLanguage();
  const store = useMotionStore();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    store.lenisControl(true);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      store.lenisControl(false);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: ease.cinematic }}
      className="fixed inset-0 z-[90] bg-canvas/95 backdrop-blur-xl overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 py-4 bg-gradient-to-b from-canvas to-transparent">
        <span className="label-cinematic">{project.tag}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            aria-label="Previous project"
            className="h-10 w-10 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-accent/40 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onNext}
            aria-label="Next project"
            className="h-10 w-10 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-accent/40 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            ref={closeRef}
            onClick={onClose}
            className="ml-2 h-10 px-4 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white hover:border-accent/40 flex items-center gap-1.5 transition-colors"
          >
            {t('work.case.close')} <X size={14} />
          </button>
        </div>
      </div>

      {/* Stage */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: ease.cinematic }}
        className="mx-auto max-w-6xl px-5 sm:px-8"
      >
        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/[0.08] bg-black/40">
          {project.videoUrl ? (
            <video
              src={project.videoUrl}
              poster={project.thumbnail || undefined}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          ) : project.thumbnail ? (
            <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-accent/30 text-xs uppercase tracking-[0.25em]">
              Media pending
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-7">
            <h3 className="heading-cinematic text-4xl sm:text-5xl lg:text-6xl text-white">
              {project.title}
            </h3>
            <p className="mt-3 text-sm text-white/40 uppercase tracking-widest">
              {project.client} · {project.year}
            </p>
            <p className="mt-8 text-base text-white/60 leading-relaxed max-w-xl">
              {project.description}
            </p>
          </div>

          <div className="md:col-span-5 space-y-8">
            <MetaBlock label={t('work.case.brief')} body={project.clientBrief} />
            <MetaBlock label={t('work.case.stack')} list={project.softwareStack} />
            <MetaBlock label={t('work.case.deliverables')} list={project.deliverables} />
          </div>
        </div>

        <div className="h-16" />
      </motion.div>
    </motion.div>
  );
};

function MetaBlock({ label, body, list }: { label: string; body?: string; list?: string[] }) {
  return (
    <div className="border-t border-white/[0.07] pt-5">
      <span className="label-cinematic block mb-3">{label}</span>
      {body && <p className="text-sm text-white/55 leading-relaxed">{body}</p>}
      {list && (
        <ul className="space-y-2">
          {list.map((item) => (
            <li key={item} className="text-sm text-white/55 flex items-center gap-2.5">
              <span className="h-px w-4 bg-accent/50" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
