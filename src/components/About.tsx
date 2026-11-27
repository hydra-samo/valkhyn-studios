import React from 'react';
import { Reveal } from './Reveal';
import { assetUrl } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';

/** About — flat editorial band: operator portrait lifting past the frame top. */
export const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="agency-band relative px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:py-36 lg:px-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-12">
        <Reveal className="md:col-span-5">
          <div className="operator-portrait soft-frame relative aspect-[4/5]">
            <img
              src={assetUrl('portrait/operator-portrait.webp')}
              srcSet={`${assetUrl('portrait/operator-portrait-600.webp')} 600w, ${assetUrl('portrait/operator-portrait.webp')} 1000w`}
              sizes="(max-width: 767px) 90vw, 500px"
              alt={t('about.portraitAlt')}
              width={1000}
              height={1250}
              loading="lazy"
              decoding="async"
              className="operator-figure"
              draggable={false}
            />
          </div>
        </Reveal>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <h2 className="heading-display text-4xl text-[var(--md-sys-color-on-surface)] sm:text-5xl md:text-6xl">
              {t('about.lead')}
              <span className="text-[var(--md-sys-color-primary)]"> {t('about.accent')}</span> {t('about.tail')}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="md3-body mt-7 max-w-xl text-[15px] leading-[1.75] text-[var(--md-sys-color-on-surface-soft)]">
              {t('about.body')}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <h3 className="heading-display mt-8 text-2xl sm:text-3xl">
              <span className="text-[var(--md-sys-color-on-surface-soft)]">{t('about.operatorLabel')}</span>{' '}
              <span className="text-[var(--md-sys-color-primary)]">{t('about.operatorName')}</span>
            </h3>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
