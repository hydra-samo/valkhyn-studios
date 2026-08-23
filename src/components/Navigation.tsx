import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useLanguage, type Lang } from '../i18n/LanguageContext';
import { HydraLogo } from './HydraLogo';

interface NavigationProps {
  onOpenBrief?: () => void;
}

const NAV_LINKS = [
  { key: 'nav.work', href: '#work' },
  { key: 'nav.process', href: '#services' },
  { key: 'nav.origin', href: '#about' },
] as const;

const LANG_CYCLE: Lang[] = ['en', 'fr', 'ar'];

const LANG_LABELS: Record<Lang, string> = {
  en: 'EN',
  fr: 'FR',
  ar: 'ع',
};

/**
 * Minimal floating navigation pill. Transparent by default, frosted glass on
 * scroll. Hides on scroll-down, reappears on scroll-up. Uses refs for scroll
 * tracking to avoid re-render glitches.
 */
export const Navigation: React.FC<NavigationProps> = ({ onOpenBrief }) => {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 60);
        setCompact(y > lastScrollYRef.current && y > 200);
        lastScrollYRef.current = y;
        tickingRef.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cycleLang = () => {
    const idx = LANG_CYCLE.indexOf(lang);
    setLang(LANG_CYCLE[(idx + 1) % LANG_CYCLE.length]);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        compact ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-4 rounded-full border transition-all duration-500 px-4 sm:px-6',
          compact ? 'h-11' : 'h-12 sm:h-13',
          scrolled
            ? 'bg-black/50 backdrop-blur-2xl border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
            : 'bg-white/[0.03] backdrop-blur-xl border-white/[0.04]'
        )}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group shrink-0">
          <HydraLogo className="h-5 w-5 sm:h-6 sm:w-6 text-accent transition-transform duration-300 group-hover:scale-110" />
          <span className="font-display font-bold tracking-[-0.02em] text-[11px] sm:text-xs uppercase text-white/90 hidden sm:block">
            HYDRA SAMO
          </span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
          {NAV_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="hover:text-white transition-colors duration-300"
            >
              {t(link.key)}
            </a>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={cycleLang}
            className="min-h-[36px] rounded-full border border-white/[0.08] bg-white/[0.04] text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-all px-3"
            aria-label={t('lang.selectAria')}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={lang}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
              >
                {LANG_LABELS[lang]}
              </motion.span>
            </AnimatePresence>
          </button>

          {onOpenBrief && (
            <button
              onClick={onOpenBrief}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 min-h-[36px] rounded-full bg-accent text-black hover:bg-accent-soft text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
            >
              {t('btn.startProjectShort')}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
