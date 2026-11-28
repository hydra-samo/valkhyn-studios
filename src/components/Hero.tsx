import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { assetUrl } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';

interface HeroReel {
  src: string;
  poster: string;
}

/** Editing → motion → voice. The stack dissolves; no clip uses `loop`. */
const HERO_REELS: HeroReel[] = [
  { src: 'video/studio-process.mp4', poster: 'video/studio-process.webp' },
  { src: 'video/video-motion.mp4', poster: 'video/video-motion.webp' },
  { src: 'video/video-voice.mp4', poster: 'video/video-voice.webp' },
];

/**
 * Hero — company masthead over a slowly crossfading studio reel.
 * The footage keeps its real colour with a light cleanup grade; a flat plate
 * carries the copy in both themes, and small screens lift the clip brightness.
 * The shell uses `100svh`, not `100dvh`: a growing hero when mobile browser
 * chrome hides would make scroll anchoring snap the page back mid-fling.
 */
export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeRef = useRef(0);
  const visibleRef = useRef(true);
  const reduceRef = useRef(false);
  const [active, setActive] = useState(0);

  // Keep playback in step with motion preference, tab visibility and viewport.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceRef.current = reduce.matches;

    const sync = () => {
      const video = videoRefs.current[activeRef.current];
      if (!video) return;
      if (reduce.matches || !visibleRef.current || document.hidden) video.pause();
      else void video.play().catch(() => undefined);
    };

    const onPreference = () => {
      reduceRef.current = reduce.matches;
      sync();
    };

    reduce.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', sync);

    const observer = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0.01 },
    );
    if (root.current) observer.observe(root.current);

    sync();

    return () => {
      reduce.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', sync);
      observer.disconnect();
    };
  }, []);

  // One reel plays at a time. The outgoing clip holds its last frame under the
  // fade, so the hand-off never lands on a blank or restarted frame.
  useEffect(() => {
    activeRef.current = active;
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index !== active) {
        video.pause();
        return;
      }
      if (reduceRef.current || !visibleRef.current || document.hidden) return;
      if (video.ended || video.currentTime > 0.05) video.currentTime = 0;
      void video.play().catch(() => undefined);
    });
  }, [active]);

  const advance = useCallback(() => {
    const next = (activeRef.current + 1) % HERO_REELS.length;
    const incoming = videoRefs.current[next];
    // Rewind while the reel is still hidden, so the loop never jumps mid-fade.
    if (incoming && (incoming.ended || incoming.currentTime > 0.05)) incoming.currentTime = 0;
    setActive(next);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-in', {
        opacity: 0,
        y: 10,
        duration: 0.32,
        ease: 'power3.out',
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={root}
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden px-5 pt-28 pb-[max(4rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-[max(5rem,env(safe-area-inset-bottom))]"
    >
      <div className="soft-frame pointer-events-none absolute inset-3 sm:inset-5" aria-hidden="true">
        {HERO_REELS.map((reel, index) => (
          <video
            key={reel.src}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            className={`hero-video hero-reel absolute inset-0 h-full w-full object-cover${
              index === active ? ' is-active' : ''
            }`}
            autoPlay={index === 0}
            muted
            playsInline
            preload={index === 0 ? 'auto' : 'metadata'}
            poster={assetUrl(reel.poster)}
            onEnded={advance}
          >
            <source src={assetUrl(reel.src)} type="video/mp4" />
          </video>
        ))}
      </div>

      <div className="hero-panel hero-in relative z-10 w-full max-w-3xl">
        <h1 className="hero-title heading-display">{t('hero.title')}</h1>
        <p className="hero-copy md3-body mt-6">{t('hero.blurb')}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#work"
            className="md3-button md3-button--filled md3-state-layer group inline-flex rounded-full"
          >
            {t('hero.ctaWork')}
            <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </a>
          <a
            href="#contact"
            className="md3-button md3-button--outlined md3-state-layer group inline-flex rounded-full"
          >
            {t('hero.ctaContact')}
            <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
