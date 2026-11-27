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
    <section id="process" className="relative overflow-hidden px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:py-36 lg:px-20">
      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal>
          <h2 className="md3-title normal-case max-w-3xl text-4xl text-[var(--md-sys-color-on-surface)] sm:text-5xl md:text-6xl">
            {t('process.lead')} <span className="text-[var(--md-sys-color-primary)]">{t('process.accent')}</span>
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* Vertical connector */}
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-[var(--md-sys-color-outline-variant)] sm:left-[11px]" aria-hidden="true" />

          <div className="flex flex-col gap-10 sm:gap-12">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.index} delay={i * 0.05}>
                <div className="group relative flex gap-6 sm:gap-8">
                  {/* Node */}
                  <div className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center sm:h-6 sm:w-6">
                    <span className="absolute inset-0 rounded-full border border-[var(--md-sys-color-outline-variant)] transition-colors duration-200 group-hover:border-[var(--md-sys-color-primary)]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--md-sys-color-primary)] transition-colors duration-200" />
                  </div>

                  <div className="flex-1 border-b border-[var(--md-sys-color-outline-variant)] pb-8">
                    <div className="flex items-baseline gap-4">
                      <span className="section-number">{step.index.padStart(2, '0')}</span>
                      <h3 className="font-display text-xl text-[var(--md-sys-color-on-surface)] transition-colors duration-200 group-hover:text-[var(--md-sys-color-primary)] sm:text-2xl">
                        {t(`process.${step.index}.title`)}
                      </h3>
                    </div>
                    <p className="md3-body mt-3 max-w-2xl pl-0 text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)] sm:pl-8">
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
