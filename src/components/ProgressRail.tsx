import React, { useState } from 'react';
import { motion, useMotionValueEvent } from 'framer-motion';
import { useMotionStore } from '../lib/motionEngine';
import { SECTIONS } from '../lib/motionEngine/assetRegistry';
import { useLanguage } from '../i18n/LanguageContext';

const LABEL_KEYS: Record<string, string> = {
  hero: 'nav.home',
  about: 'nav.origin',
  work: 'nav.work',
  services: 'nav.process',
  contact: 'nav.contact',
};

/**
 * Fixed left-edge scroll progress rail with chapter markers. Desktop only.
 * Fill is a MotionValue bound directly to scaleY — no re-renders; the active
 * dot is the only state (changes once per section).
 */
export const ProgressRail = React.memo(function ProgressRail() {
  const store = useMotionStore();
  const { t } = useLanguage();
  const [active, setActive] = useState('hero');

  useMotionValueEvent(store.currentSection, 'change', (v) => {
    setActive(String(v));
  });

  return (
    <div
      className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4"
      aria-hidden="true"
    >
      <div className="relative h-40 w-px bg-white/10 overflow-visible">
        <motion.div
          className="absolute top-0 left-0 w-px h-full origin-top bg-accent"
          style={{ scaleY: store.scrollProgress }}
        />
        {SECTIONS.map((s) => (
          <button
            key={s}
            tabIndex={-1}
            className="absolute -left-[3px] group"
            style={{ top: `${(SECTIONS.indexOf(s) / (SECTIONS.length - 1)) * 100}%` }}
            onClick={() => {
              document.getElementById(s)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span
              className={`block h-[7px] w-[7px] rounded-full border transition-colors duration-300 ${
                active === s ? 'bg-accent border-accent' : 'bg-transparent border-white/30 group-hover:border-white/60'
              }`}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.2em] font-semibold text-white/0 group-hover:text-white/50 transition-colors duration-300">
              {t(LABEL_KEYS[s] ?? 'nav.home')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});
