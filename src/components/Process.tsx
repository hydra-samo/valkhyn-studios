import React from 'react';
import { PROCESS_STEPS } from '../data/content';
import { Reveal } from './Reveal';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Process — a real five-step sequence, so numbering carries information.
 * A coded vertical connector line ties the steps together.
 */
export const Process: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="process" className="relative overflow-hidden px-6 py-24 sm:px-10 md:px-14 md:py-36 lg:px-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-0 top-1/4 h-[460px] w-[460px] rounded-full bg-accent/[0.04] blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal>
          <h2 className="heading-display max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
            {t('process.lead')} <span className="text-accent">{t('process.accent')}</span>
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* Vertical connector */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/40 via-accent/15 to-transparent sm:left-[11px]" aria-hidden="true" />

          <div className="flex flex-col gap-10 sm:gap-12">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.index} delay={i * 0.05}>
                <div className="group relative flex gap-6 sm:gap-8">
                  {/* Node */}
                  <div className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center sm:h-6 sm:w-6">
                    <span className="absolute inset-0 rounded-full border border-accent/30 transition-colors duration-500 group-hover:border-accent" />
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/60 transition-all duration-500 group-hover:bg-accent group-hover:scale-125" />
                  </div>

                  <div className="flex-1 border-b border-white/[0.06] pb-8">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[10px] text-accent/50">
                        {step.index.padStart(2, '0')}
                      </span>
                      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white transition-colors duration-500 group-hover:text-accent sm:text-2xl">
                        {t(`process.${step.index}.title`)}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-2xl pl-0 text-sm leading-relaxed text-white/60 sm:pl-8">
                      {t(`process.${step.index}.desc`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
