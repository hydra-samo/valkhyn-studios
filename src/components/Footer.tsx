import React from 'react';
import { motion } from 'framer-motion';
import { Reveal } from './motion/Reveal';
import { useLanguage } from '../i18n/LanguageContext';

const SOCIAL_LINKS = [
  { name: 'YouTube', href: '#' },
  { name: 'Instagram', href: '#' },
  { name: 'Vimeo', href: '#' },
  { name: 'LinkedIn', href: '#' },
];

export const Footer = React.memo(function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer
      data-section="footer"
      className="relative py-16 sm:py-20 px-5 sm:px-8 lg:px-12 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <Reveal cinematic>
            <span className="font-display font-bold tracking-[-0.02em] text-sm uppercase text-white">
              HYDRA SAMO
            </span>
            <p className="text-xs text-white/40 mt-0.5">
              {t('hero.headingVideo').replace('.', '')} &middot; {t('hero.headingMotion').replace('.', '')} &middot; {t('hero.headingVoice').replace('.', '')}
            </p>
          </Reveal>

          <Reveal delay={0.1} cinematic>
            <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em] font-semibold text-white/40">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="hover:text-white transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} cinematic>
          <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30">
              &copy; {year} {t('about.badgeName')} — Hydra Samo. All rights reserved.
            </p>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-semibold">
              Crafted with precision
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
});
