import React from 'react';
import { motion } from 'framer-motion';
import { CinematicSection } from './motion/CinematicSection';
import { Reveal } from './motion/Reveal';
import { ease, duration } from '../lib/motionTokens';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * About — Origin Story. Cinematic composition with oversized editorial type
 * and the narrative text. Green is used only for emphasis — the heading accent
 * and the advantage markers.
 */
export const AboutSection = React.memo(function AboutSection() {
  const { t } = useLanguage();

  const advantages = [
    t('about.adv1'),
    t('about.adv2'),
    t('about.adv3'),
    t('about.adv4'),
  ];

  return (
    <CinematicSection
      id="about"
      data-section="about"
      data-atmosphere-theme="origin"
      className="relative py-24 sm:py-32 md:py-44 px-5 sm:px-8 lg:px-12 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          {/* Empty left column — portrait space */}
          <div className="hidden md:block md:col-span-7" />

          <div className="md:col-span-5 md:col-start-8">
            {/* ── Section Header ──────────────────────────────────────────── */}
            <Reveal cinematic>
              <span className="label-cinematic block mb-4">
                {t('about.eyebrow')}
              </span>
              <h2 className="heading-cinematic text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white">
                {t('about.headingOne')}
                <br />
                <span className="text-accent">{t('about.headingTwo')}</span>
              </h2>
            </Reveal>

            {/* ── Narrative Text ───────────────────────────────────────────── */}
            <Reveal delay={0.15} cinematic>
              <div className="space-y-5 text-white/50 text-sm sm:text-base leading-relaxed max-w-xl mt-8">
                <p>
                  {t('about.p1a')}{' '}
                  <strong className="text-white/80 font-semibold">{t('about.badgeName')}</strong>{' '}
                  {t('about.p1b')}{' '}
                  <strong className="text-accent font-semibold">Hydra Samo</strong>
                  {t('about.p1c')}
                </p>
                <p>{t('about.p2')}</p>
                <p>{t('about.p3')}</p>
              </div>
            </Reveal>

            {/* ── Advantages Grid ──────────────────────────────────────────── */}
            <Reveal delay={0.3} cinematic>
              <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-8 border-t border-white/[0.05]">
                {advantages.map((label, idx) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: duration.mid, delay: 0.4 + idx * 0.1, ease: ease.cinematic }}
                  >
                    <h3 className="text-white/80 text-sm font-bold uppercase tracking-wider">
                      {label}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </CinematicSection>
  );
});
