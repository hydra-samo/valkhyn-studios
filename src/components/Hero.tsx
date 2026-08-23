import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import { ease, duration, stagger } from '../lib/motionTokens';

export const Hero = React.memo(function Hero() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const HEADING_LINES = ['hero.headingVideo', 'hero.headingMotion', 'hero.headingVoice'] as const;

  return (
    <section
      ref={ref}
      data-section="hero"
      className="relative w-full h-screen overflow-hidden"
    >
      {/* ── Atmospheric Glow ── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ opacity: glowOpacity }}
        aria-hidden="true"
      >
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-accent/[0.06] blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-[100px]" />
      </motion.div>

      {/* ── Brand Typography — overlays portrait bottom ── */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* ── SAMO — ghost tagline, stretches across viewport ── */}
        <motion.div
          className="absolute left-0 right-0 w-full overflow-hidden"
          style={{ top: '52%' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.hero, delay: 0.4, ease: ease.cinematic }}
        >
          <span
            className="heading-cinematic block w-full text-center text-[12vw] sm:text-[13vw] md:text-[14vw] lg:text-[15vw] xl:text-[16vw] text-white/[0.05] select-none leading-none"
            aria-hidden="true"
          >
            SAMO
          </span>
        </motion.div>

        {/* ── HYDRA — stretches across viewport ── */}
        <motion.div
          className="absolute left-0 right-0 w-full overflow-hidden"
          style={{ top: '55%' }}
          initial={{ opacity: 0, y: 40, filter: 'blur(16px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: duration.hero, delay: 0.6, ease: ease.cinematic }}
        >
          <h1
            className="heading-cinematic block w-full text-center text-[11vw] sm:text-[12vw] md:text-[13vw] lg:text-[14vw] xl:text-[15vw] text-white leading-[0.85]"
            style={{ textShadow: '0 4px 60px rgba(0,0,0,0.9), 0 0 120px rgba(0,0,0,0.5)' }}
          >
            HYDRA
          </h1>
        </motion.div>
      </motion.div>

      {/* ── Heading + Description Grid — bottom of viewport ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-[1] px-5 sm:px-8 lg:px-12 pb-16 sm:pb-20"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-20 items-end">
          {/* Left — Heading lines */}
          <div className="flex flex-col">
            {HEADING_LINES.map((key, i) => {
              const isAccent = key === 'hero.headingVoice';
              return (
                <motion.span
                  key={key}
                  className={`block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-display font-bold uppercase tracking-tight leading-[1.1] ${
                    isAccent ? 'text-accent' : 'text-white/80'
                  }`}
                  initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: duration.hero,
                    delay: 1.0 + i * stagger.line,
                    ease: ease.cinematic,
                  }}
                  style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                >
                  {t(key)}
                </motion.span>
              );
            })}
          </div>

          {/* Right — Description */}
          <motion.div
            className="flex flex-col justify-end"
            initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: duration.section, delay: 1.3, ease: ease.cinematic }}
          >
            <p className="text-sm sm:text-base md:text-lg text-white/40 font-normal leading-relaxed max-w-md lg:max-w-lg md:ml-auto">
              <strong className="text-white/70 font-medium">{t('about.badgeName')}</strong>{' '}
              {t('hero.description')}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[3]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1.2 }}
        style={{ opacity: contentOpacity }}
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/20 font-semibold">
          Scroll
        </span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-accent/40 to-transparent origin-top"
          animate={{ scaleY: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
});
