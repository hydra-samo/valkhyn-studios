import React from 'react';
import { Reveal } from './Reveal';
import { MagneticButton } from './MagneticButton';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Work — honest by design.
 * No fabricated case studies. The gallery opens as a coded "signal" panel that
 * states plainly where the work stands, and the capability tiles below show the
 * three disciplines in motion rather than inventing client projects.
 */
export const Work: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="work" className="relative overflow-hidden px-6 py-24 sm:px-10 md:px-14 md:py-36 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="heading-display text-4xl text-white sm:text-5xl md:text-6xl">
                {t('work.title')}
              </h2>
            </div>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
              {t('work.status')}
            </span>
          </div>
        </Reveal>

        {/* Coded empty state — honest, not a placeholder card grid */}
        <Reveal delay={0.08}>
          <div className="bezel mt-12">
            <div className="bezel-core relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
              <SignalField />
              <div className="relative z-10">
                <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-accent/25">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
                </span>
                <h3 className="heading-display text-2xl text-white sm:text-3xl">
                  {t('work.empty.title')}
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                  {t('work.empty.body')}
                </p>
                <div className="mt-7">
                  <MagneticButton href="#contact">
                    {t('work.empty.cta')}
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/15">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Capability tiles — the three heads in motion, not fake projects */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <CapabilityTile kind="video" title={t('work.cut.title')} note={t('work.cut.note')} />
          <CapabilityTile kind="motion" title={t('work.motion.title')} note={t('work.motion.note')} />
          <CapabilityTile kind="voice" title={t('work.sound.title')} note={t('work.sound.note')} />
        </div>
      </div>
    </section>
  );
};

/** Animated line-field used as the empty-state backdrop. */
const SignalField: React.FC = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
    viewBox="0 0 800 340"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    {Array.from({ length: 16 }).map((_, i) => {
      const y = 20 + i * 20;
      return (
        <path
          key={i}
          d={`M -50 ${y} C 150 ${y + (i % 2 === 0 ? 30 : -30)}, 300 ${y - 24}, 450 ${
            y + (i % 2 === 0 ? 18 : -18)
          } S 700 ${y - 16}, 850 ${y}`}
          fill="none"
          stroke="#34d399"
          strokeWidth="0.6"
          strokeOpacity={0.18 + (i % 4) * 0.06}
        />
      );
    })}
  </svg>
);

const CapabilityTile: React.FC<{
  kind: 'video' | 'motion' | 'voice';
  title: string;
  note: string;
}> = ({ kind, title, note }) => (
  <Reveal>
    <div className="bezel">
      <div className="bezel-core group relative min-h-[200px] overflow-hidden p-6">
        <div className="mt-10 flex h-16 items-center">
          {kind === 'video' && <Waveform />}
          {kind === 'motion' && <Orbit />}
          {kind === 'voice' && <VoiceBars />}
        </div>
        <h4 className="mt-5 font-display text-lg font-bold uppercase tracking-tight text-white">
          {title}
        </h4>
        <p className="mt-1 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/55">
          {note}
        </p>
      </div>
    </div>
  </Reveal>
);

const Waveform: React.FC = () => (
  <div className="flex h-12 items-end gap-1" aria-hidden="true">
    {[16, 30, 22, 40, 26, 44, 20, 34, 24, 38, 18, 30].map((h, i) => (
      <span
        key={i}
        className="w-1 rounded-full bg-accent/40 transition-all duration-500 group-hover:bg-accent/70"
        style={{ height: h, transitionDelay: `${i * 20}ms` }}
      />
    ))}
  </div>
);

const Orbit: React.FC = () => (
  <svg width="90" height="64" viewBox="0 0 90 64" fill="none" aria-hidden="true">
    <ellipse cx="45" cy="32" rx="40" ry="25" stroke="#10b981" strokeOpacity="0.4" strokeWidth="0.8" />
    <ellipse cx="45" cy="32" rx="26" ry="16" stroke="#10b981" strokeOpacity="0.55" strokeWidth="0.8" />
    <circle cx="45" cy="32" r="5" fill="#10b981" fillOpacity="0.65" />
    <circle cx="82" cy="28" r="2.2" fill="#34d399" />
    <circle cx="20" cy="40" r="1.8" fill="#34d399" fillOpacity="0.7" />
  </svg>
);

const VoiceBars: React.FC = () => (
  <div className="flex h-12 items-center gap-1.5" aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className="w-0.5 rounded-full bg-accent/50"
        style={{
          height: `${18 + Math.abs(Math.sin(i * 1.4)) * 30}px`,
          animation: `float-slow ${1.4 + i * 0.2}s ease-in-out infinite`,
        }}
      />
    ))}
  </div>
);
