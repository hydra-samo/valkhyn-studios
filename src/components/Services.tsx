import React, { useEffect, useRef, useState } from 'react';
import { DISCIPLINES, SERVICE_FRAMES } from '../data/content';
import { Reveal } from './Reveal';
import { assetUrl } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';

const FRAME_DURATION = 4200;

/**
 * Services — three disciplines under one studio roof.
 * A quiet four-frame studio reel (editing, motion, voice, delivery) and a
 * ruled capability ledger replace the old three-card grid. Each still has an
 * art-directed crop per breakpoint; none is presented as a client project.
 */
export const Services: React.FC = () => {
  const { t } = useLanguage();
  const frameRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: number | undefined;

    const stop = () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const start = () => {
      if (timer !== undefined || reduce.matches || !visibleRef.current || document.hidden) return;
      timer = window.setInterval(() => {
        setActive((current) => (current + 1) % SERVICE_FRAMES.length);
      }, FRAME_DURATION);
    };

    const sync = () => {
      stop();
      start();
    };

    reduce.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);

    const observer = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0.01 },
    );
    if (frameRef.current) observer.observe(frameRef.current);

    sync();

    return () => {
      stop();
      reduce.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      observer.disconnect();
    };
  }, []);

  return (
    <section id="services" className="relative px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:py-36 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="heading-display max-w-3xl text-4xl text-[var(--md-sys-color-on-surface)] sm:text-5xl md:text-6xl">
              {t('services.lead')} <span className="text-[var(--md-sys-color-primary)]">{t('services.accent')}</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div
            ref={frameRef}
            className="soft-frame service-media relative mt-10 w-full overflow-hidden"
          >
            {SERVICE_FRAMES.map((frame, index) => (
              <picture
                key={frame.src}
                className={`service-frame${index === active ? ' is-active' : ''}`}
              >
                <source media="(max-width: 640px)" srcSet={assetUrl(frame.srcPhone)} />
                <img
                  src={assetUrl(frame.src)}
                  alt={t(frame.altKey)}
                  aria-hidden={index !== active}
                  width={1600}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="agency-photo"
                  draggable={false}
                />
              </picture>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 border-t border-[var(--md-sys-color-outline-variant)]">
          {DISCIPLINES.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.05}>
              <article className="grid grid-cols-1 gap-4 border-b border-[var(--md-sys-color-outline-variant)] py-8 md:grid-cols-12 md:items-baseline md:gap-6">
                <span className="section-number md:col-span-1">0{i + 1}</span>
                <div className="md:col-span-4">
                  <h3 className="font-display text-2xl font-semibold text-[var(--md-sys-color-on-surface)]">
                    {t(`disc.${d.id}.title`)}
                  </h3>
                  <p className="section-subtext mt-1">{t(`disc.${d.id}.subtitle`)}</p>
                </div>
                <p className="md3-body max-w-2xl text-sm leading-[1.75] text-[var(--md-sys-color-on-surface-soft)] md:col-span-7">
                  {t(`disc.${d.id}.desc`)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
