import React from 'react';
import { ValkhynLogo } from './ValkhynLogo';
import { SocialIcons } from './SocialIcons';
import { useLanguage } from '../i18n/LanguageContext';
import { LEGAL_PAGES } from '../i18n/legal';

export const Footer: React.FC = () => {
  const { t, lang } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--md-sys-color-outline-variant)] px-6 py-12 sm:px-10 md:px-14 lg:px-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <a href="#home" className="flex items-center gap-3">
            <ValkhynLogo className="h-7 w-7 text-[var(--md-sys-color-primary)]" />
            <div>
              <span className="block font-display text-sm font-bold uppercase tracking-[0.12em] text-[var(--md-sys-color-on-surface)]">
                VALKHYN
              </span>
            </div>
          </a>

          <a
            href="#home"
            className="md3-label text-[var(--md-sys-color-on-surface-variant)] transition-colors duration-300 hover:text-[var(--md-sys-color-primary)]"
          >
            {t('footer.top')}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--md-sys-color-outline-variant)] pt-6">
          <SocialIcons />
          <p className="md3-label text-[var(--md-sys-color-on-surface-variant)]">{t('footer.motto')}</p>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-[var(--md-sys-color-outline-variant)] pt-6 sm:flex-row sm:items-center">
          <p className="md3-label text-[var(--md-sys-color-on-surface-variant)]">
            © {year} VALKHYN Studio · All rights reserved
          </p>
          <div className="flex items-center gap-5">
            <a
              href="#legal"
              className="md3-label text-[var(--md-sys-color-on-surface-variant)] transition-colors duration-300 hover:text-[var(--md-sys-color-primary)]"
            >
              {LEGAL_PAGES[lang].legal.linkLegal}
            </a>
            <a
              href="#privacy"
              className="md3-label text-[var(--md-sys-color-on-surface-variant)] transition-colors duration-300 hover:text-[var(--md-sys-color-primary)]"
            >
              {LEGAL_PAGES[lang].privacy.linkPrivacy}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
