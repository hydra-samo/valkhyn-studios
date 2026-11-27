import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Work — honest by design.
 * No fabricated case studies, no capability cards, no animated icons. The
 * empty state is a single flat editorial band that will hold real work later.
 */
export const Work: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="work" className="agency-band relative px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:py-36 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="heading-display text-4xl text-[var(--md-sys-color-on-surface)] sm:text-5xl md:text-6xl">
            {t('work.title')}
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 grid grid-cols-1 gap-8 border-y border-[var(--md-sys-color-outline-variant)] py-14 md:grid-cols-12 md:items-end md:py-16">
            <div className="md:col-span-7">
              <h3 className="heading-display text-2xl text-[var(--md-sys-color-on-surface)] sm:text-3xl">
                {t('work.empty.title')}
              </h3>
              <p className="md3-body mt-4 max-w-xl text-sm leading-[1.75] text-[var(--md-sys-color-on-surface-soft)]">
                {t('work.empty.body')}
              </p>
            </div>
            <div className="md:col-span-5 md:justify-self-end">
              <a
                href="#contact"
                className="md3-button md3-button--filled md3-state-layer group inline-flex rounded-full"
              >
                {t('work.empty.cta')}
                <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
