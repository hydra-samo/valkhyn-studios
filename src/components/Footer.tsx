import React from 'react';
import { HydraLogo } from './HydraLogo';
import { EMAIL } from '../data/content';
import { useLanguage } from '../i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] px-6 py-12 sm:px-10 md:px-14 lg:px-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <a href="#home" className="flex items-center gap-3">
            <HydraLogo className="h-7 w-7 text-accent glow-accent" />
            <div>
              <span className="block font-display text-sm font-bold uppercase tracking-[0.12em] text-white">
                Hydra Samo
              </span>
              <span className="mt-0.5 block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/55">
                {t('footer.tagline')}
              </span>
            </div>
          </a>

          <div className="flex items-center gap-6">
            <a
              href={`mailto:${EMAIL}`}
              className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/55 transition-colors duration-300 hover:text-accent"
            >
              {EMAIL}
            </a>
            <a
              href="#home"
              className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/55 transition-colors duration-300 hover:text-accent"
            >
              {t('footer.top')}
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
            © {year} Bendali Issam Eddine · All rights reserved
          </p>
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
            {t('footer.motto')}
          </p>
        </div>
      </div>
    </footer>
  );
};
