import React from 'react';
import { Reveal } from './Reveal';
import { assetUrl } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * About — origin story. Portrait on the left, editorial statement on the right.
 * The "three heads" idea is set as the structural device, not decoration.
 */
export const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="relative overflow-hidden px-6 py-24 sm:px-10 md:px-14 md:py-36 lg:px-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-0 top-1/3 h-[420px] w-[420px] rounded-full bg-accent/[0.05] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 md:grid-cols-12 md:gap-10">
        {/* Portrait */}
        <Reveal cinematic className="md:col-span-5">
          <div className="bezel portrait-lock">
            <div className="bezel-core relative aspect-[4/5] overflow-hidden">
              <img
                src={assetUrl('portrait/about.webp')}
                alt="VALKHYN portrait"
                width={1000}
                height={1250}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[35%_50%]"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
                Bendali Issam Eddine
              </span>
            </div>
          </div>
        </Reveal>

        {/* Statement */}
        <div className="md:col-span-6 md:col-start-7">
          <Reveal delay={0.05}>
            <h2 className="heading-display text-4xl text-white sm:text-5xl">
              {t('about.lead')}
              <span className="text-accent"> {t('about.accent')}</span> {t('about.tail')}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
              {t('about.body')}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
