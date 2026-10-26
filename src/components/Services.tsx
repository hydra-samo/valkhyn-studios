import React from 'react';
import { Film, Layers, Mic } from 'lucide-react';
import { DISCIPLINES } from '../data/content';
import { Reveal } from './Reveal';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Services — the three heads. Each row is a chapter with a stock lucide glyph,
 * a title, a statement and the real toolchain set as a plain technical line.
 * No cards, no chips, no eyebrow: rows separated only by hairlines.
 */
export const Services: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="services" className="relative overflow-hidden px-6 py-24 sm:px-10 md:px-14 md:py-36 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="heading-display max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
            {t('services.lead')} <span className="text-accent">{t('services.accent')}</span>
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col">
          {DISCIPLINES.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.06}>
              <div className="group grid grid-cols-1 gap-6 border-t border-white/[0.08] py-10 transition-colors duration-500 hover:border-accent/30 sm:grid-cols-12 sm:gap-8 sm:py-12">
                {/* Motif — stock lucide glyphs, per brand icon rule */}
                <div className="flex items-start gap-5 sm:col-span-2">
                  <Motif kind={d.id} />
                </div>

                {/* Title */}
                <div className="sm:col-span-4">
                  <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
                    {t(`disc.${d.id}.subtitle`)}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-white transition-colors duration-500 group-hover:text-accent sm:text-3xl">
                    {t(`disc.${d.id}.title`)}
                  </h3>
                </div>

                {/* Description + tools */}
                <div className="sm:col-span-6">
                  <p className="max-w-sm text-sm leading-relaxed text-white/60">
                    {t(`disc.${d.id}.desc`)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="label-tech">
                      {d.tools.join('  ·  ')}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/** Small coded motifs — one per discipline. No icon library, no images. */
const Motif: React.FC<{ kind: 'video' | 'motion' | 'voice' }> = ({ kind }) => {
  const Icon = kind === 'video' ? Film : kind === 'motion' ? Layers : Mic;
  return <Icon size={26} strokeWidth={1.1} className="text-accent/75" aria-hidden="true" />;
};
