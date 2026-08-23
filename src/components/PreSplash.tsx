import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Lang } from '../i18n/translations';
import { cn } from '../lib/utils';
import { MagneticButton } from './MagneticButton';
import { HydraLogo } from './HydraLogo';
import { useCoarsePointer } from '../hooks/useCoarsePointer';
import { useDeviceTier } from '../hooks/useDeviceTier';

interface PreSplashSelectorProps {
  onComplete: () => void;
}

const LANGUAGES: { code: Lang; native: string }[] = [
  { code: 'en', native: 'English' },
  { code: 'fr', native: 'Français' },
  { code: 'ar', native: 'العربية' },
];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 180, damping: 20 },
  },
};

export const PreSplashSelector: React.FC<PreSplashSelectorProps> = ({
  onComplete,
}) => {
  const { lang, setLang, t, dir } = useLanguage();
  const reduceMotion = useReducedMotion();
  const isCoarse = useCoarsePointer();
  const tier = useDeviceTier();
  const isRTL = dir === 'rtl';

  const cheapMotion = isCoarse || tier === 'low';

  return (
    <motion.div
      key="pre-splash"
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 0.97,
        ...(cheapMotion ? {} : { filter: 'blur(8px)' }),
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-main)] select-none"
    >
      {/* Ambient blobs — skipped on low tier */}
      {tier !== 'low' && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[20vh] -left-[16vw] h-[50vw] w-[50vw] rounded-full"
            style={{ background: 'var(--blob-moss)', filter: 'blur(90px)', opacity: 0.3 }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[24vh] -right-[12vw] h-[44vw] w-[44vw] rounded-full"
            style={{ background: 'var(--blob-jade)', filter: 'blur(80px)', opacity: 0.25 }}
          />
        </>
      )}

      {/* Glass panel — compact */}
      <motion.div
        variants={reduceMotion ? undefined : stagger}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className={cn(
          'relative w-full max-w-xs sm:max-w-sm',
          'bg-[var(--card-bg)]/80',
          'border border-white/[0.08]',
          'rounded-3xl p-6 sm:p-8',
          'shadow-[0_8px_40px_rgba(0,0,0,0.35)]'
        )}
      >
        {/* Logo */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 mb-7 sm:mb-8">
          <HydraLogo className="h-9 w-9 sm:h-10 sm:w-10 text-accent hydra-mark-glow" />
          <span className="font-display font-bold tracking-[-0.02em] text-sm sm:text-[15px] uppercase text-[var(--text-main)]">
            HYDRA SAMO
          </span>
        </motion.div>

        {/* Language selector */}
        <motion.div variants={fadeUp} className="mb-6 sm:mb-7">
          <label className="block text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)] mb-2.5 text-center">
            {t('lang.label')}
          </label>
          <div
            className="grid grid-cols-3 gap-1.5 sm:gap-2"
            role="group"
            aria-label={t('lang.selectAria')}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={cn(
                  'relative min-h-[42px] sm:min-h-[46px] rounded-2xl text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors duration-200',
                  'border',
                  lang === l.code
                    ? 'border-emerald-500/50 text-white shadow-[0_0_18px_rgba(16,185,129,0.2)]'
                    : 'border-white/[0.08] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-white/20'
                )}
                aria-pressed={lang === l.code}
              >
                {lang === l.code && (
                  <motion.span
                    layoutId="preLangThumb"
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className="absolute inset-0 rounded-2xl bg-accent"
                  />
                )}
                <span className="relative z-10 block">{l.native}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Enter */}
        <motion.div variants={fadeUp}>
          <MagneticButton
            onClick={onComplete}
            className={cn(
              'group w-full min-h-[44px] px-6 py-3 rounded-2xl',
              'border border-emerald-500/40 bg-white/[0.04]',
              'text-[var(--text-main)] font-semibold text-[11px] sm:text-xs uppercase tracking-[0.2em]',
              'hover:border-emerald-500/60 hover:shadow-[0_0_22px_rgba(16,185,129,0.2)]',
              'transition-shadow duration-300',
              'flex items-center justify-center gap-2'
            )}
          >
            <span>{t('pre.enter')}</span>
            {isRTL ? (
              <ArrowLeft size={14} className="text-accent" />
            ) : (
              <ArrowRight size={14} className="text-accent" />
            )}
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Grain */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03] mix-blend-overlay">
        <filter id="pre-splash-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#pre-splash-grain)" />
      </svg>
    </motion.div>
  );
};
