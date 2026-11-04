import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

import { useLanguage } from '../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { key: 'A' },
  { key: 'B' },
  { key: 'C' },
] as const;

/**
 * Hero — poster composition.
 *
 * The VALKHYN wordmark is set enormous behind the figure and bleeds off both
 * edges, the portrait stands in front of it, and the name sits over the left
 * shoulder with the counts stacked on the right. Nothing floats above it.
 */
export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const figure = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-mark', {
        opacity: 0,
        scale: 1.06,
        duration: 1.8,
        ease: 'expo.out',
      });
      gsap.from(figure.current, {
        opacity: 0,
        y: 34,
        scale: 1.03,
        duration: 1.5,
        ease: 'expo.out',
        delay: 0.1,
      });
      gsap.from('.hero-in', {
        opacity: 0,
        y: 16,
        duration: 1,
        stagger: 0.07,
        ease: 'power3.out',
        delay: 0.35,
      });

      // The figure settles slower than the page scrolls.
      gsap.to(figure.current, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={root}
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
    >
      {/* The wordmark, set as the poster ground */}
      <span
        className="hero-mark heading-display pointer-events-none absolute left-1/2 top-[7%] z-0 w-full -translate-x-1/2 select-none whitespace-nowrap text-center text-[clamp(6rem,29vw,26rem)] leading-[0.8]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(16,185,129,0.55) 0%, rgba(16,185,129,0.24) 55%, rgba(16,185,129,0.05) 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        VALKHYN
      </span>

      {/* Top strip: role on the left, availability on the right */}
      <div className="hero-in relative z-20 flex items-start justify-between gap-6 px-5 pt-16 sm:px-8 md:pt-20">
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.26em] text-accent">
            {t('hero.roleA')}
          </span>
          <span className="font-sans text-[9px] font-medium uppercase tracking-[0.26em] text-white/45">
            {t('hero.roleB')}
          </span>
        </div>
        <span className="flex items-center gap-2">
          <span className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/55">
            {t('hero.open')}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
        </span>
      </div>

      {/* The figure: geometry asset placeholder */}
      <div ref={figure} className="portrait-lock relative z-10 mt-2 flex w-full justify-center md:pointer-events-none md:absolute md:inset-0 md:mt-0 md:items-end" />

      {/* Name block and counts */}
      <div className="relative z-20 mt-auto px-5 pb-5 sm:px-8 sm:pb-7">
        <div className="grid grid-cols-1 items-end gap-8 pb-2 sm:grid-cols-12 sm:gap-6">
          {/* Name block */}
          <div className="sm:col-span-7 lg:col-span-5">
            <p className="hero-in mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-white/55">
              {t('hero.hello')}
            </p>
            <h1 className="hero-in heading-display text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.82] text-white md:whitespace-nowrap">
              Bendali
              <br />
              Issam Eddine
            </h1>
            <p className="hero-in mt-4 font-sans text-[11px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-accent">
              {t('hero.modeA')}
              <br />
              {t('hero.modeB')}
            </p>
            <p className="hero-in mt-3 max-w-[32ch] font-sans text-[12px] leading-relaxed text-white/60 sm:text-[13px]">
              {t('hero.blurb')}
            </p>
            <div className="hero-in mt-5 flex flex-wrap items-center gap-4">
              <MagneticButton href="#work">
                {t('hero.ctaWork')}
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </MagneticButton>
              <a
                href="#contact"
                className="group flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 transition-colors duration-300 hover:text-accent"
              >
                {t('hero.ctaContact')}
                <span className="h-px w-6 bg-current transition-all duration-500 group-hover:w-9" />
              </a>
            </div>
          </div>

          {/* Counts */}
          <div className="hero-in flex gap-8 sm:col-span-4 sm:col-start-9 sm:flex-col sm:gap-5 sm:justify-self-end sm:text-right lg:col-span-3 lg:col-start-10">
            {STATS.map((s) => (
              <div key={s.key} className="flex flex-col">
                <span className="font-display text-xl font-bold leading-none text-accent sm:text-2xl">
                  {t(`hero.stat${s.key}`)}
                </span>
                <span className="mt-1 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/50">
                  {t(`hero.stat${s.key}Label`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
