import React, { useEffect } from 'react';
import { ValkhynLogo } from './ValkhynLogo';
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
    document.title = `${page.title} · VALKHYN`;
    return () => {
      document.title = previous;
    };
  }, [page.title]);

  return (
    <div className="md3-surface min-h-[100svh] px-6 py-16 sm:px-10 md:px-14 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-6 border-b border-[var(--md-sys-color-outline-variant)] pb-6">
          <a href="#home" className="flex items-center gap-3">
            <ValkhynLogo className="h-6 w-6 text-accent" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--md-sys-color-on-surface)]">
              VALKHYN
            </span>
          </a>
          <a
            href="#home"
            className="md3-label text-[var(--md-sys-color-on-surface-variant)] transition-colors duration-300 hover:text-[var(--md-sys-color-primary)]"
          >
            {page.back}
          </a>
        </div>

        <h1 className="md3-title normal-case mt-12 text-4xl text-[var(--md-sys-color-on-surface)] sm:text-5xl">{page.title}</h1>
        <p className="mt-3 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--md-sys-color-on-surface-variant)]">
          {page.updated}
        </p>

        <div className="mt-12 space-y-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="md3-title text-lg text-[var(--md-sys-color-on-surface)]">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="md3-body mt-3 text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-16 flex justify-end border-t border-[var(--md-sys-color-outline-variant)] pt-8">
          <a
            href={`#${other}`}
            className="md3-label text-[var(--md-sys-color-primary)] transition-colors duration-300 hover:text-[var(--md-sys-color-primary)]"
          >
            {LEGAL_PAGES[lang][other].title}
          </a>
        </div>
      </div>
    </div>
  );
};
