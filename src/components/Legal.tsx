import React, { useEffect } from 'react';
import { HydraLogo } from './HydraLogo';
import { EMAIL } from '../data/content';
import { useLanguage } from '../i18n/LanguageContext';
import { LEGAL_PAGES } from '../i18n/legal';

export type LegalKind = 'legal' | 'privacy';

/** Full-page legal notice / privacy policy, reached from the footer. */
export const Legal: React.FC<{ kind: LegalKind }> = ({ kind }) => {
  const { lang } = useLanguage();
  const page = LEGAL_PAGES[lang][kind];
  const other: LegalKind = kind === 'legal' ? 'privacy' : 'legal';

  useEffect(() => {
    const previous = document.title;
    document.title = `${page.title} · HYDRA SAMO`;
    return () => {
      document.title = previous;
    };
  }, [page.title]);

  return (
    <div className="min-h-[100dvh] bg-canvas px-6 py-16 text-text sm:px-10 md:px-14 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
          <a href="#home" className="flex items-center gap-3">
            <HydraLogo className="h-6 w-6 text-accent" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white">
              Hydra Samo
            </span>
          </a>
          <a
            href="#home"
            className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/55 transition-colors duration-300 hover:text-accent"
          >
            {page.back}
          </a>
        </div>

        <h1 className="heading-display mt-12 text-4xl text-white sm:text-5xl">{page.title}</h1>
        <p className="mt-3 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
          {page.updated}
        </p>

        <div className="mt-12 space-y-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-white">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-relaxed text-white/65">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.08] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={`mailto:${EMAIL}`}
            className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/55 transition-colors duration-300 hover:text-accent"
          >
            {EMAIL}
          </a>
          <a
            href={`#${other}`}
            className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-accent"
          >
            {LEGAL_PAGES[lang][other].title}
          </a>
        </div>
      </div>
    </div>
  );
};
