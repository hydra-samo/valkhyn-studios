import React, { useEffect, useState } from 'react';
import { ValkhynLogo } from './ValkhynLogo';
import { useLanguage } from '../i18n/LanguageContext';

interface SplashProps {
  onComplete: () => void;
}

const SETTLE_DELAY = 1400;
const HARD_CAP = 4500;

/**
 * Studio splash — emerald wash, mark, progress readout. Sits above everything,
 * finishes on its own, and can be dismissed by a click.
 */
export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const settle = window.setTimeout(onComplete, SETTLE_DELAY);
    const hardCap = window.setTimeout(onComplete, HARD_CAP);
    const iv = window.setInterval(() => setPercent((p) => Math.min(100, p + 12)), 130);

    return () => {
      window.clearTimeout(settle);
      window.clearTimeout(hardCap);
      window.clearInterval(iv);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      title={t('splash.skip')}
      className="fixed inset-0 z-[9999] flex cursor-pointer select-none flex-col items-center justify-center overflow-hidden"
      style={{ background: '#060c09' }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 50% -10%, rgba(16,185,129,0.07), transparent 55%), radial-gradient(120% 120% at 90% 110%, rgba(5,150,105,0.08), transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -left-[12%] -top-[18%] h-[72vh] w-[72vh] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-[22%] -right-[10%] h-[78vh] w-[78vh] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.16) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <ValkhynLogo className="h-12 w-12 text-accent sm:h-14 sm:w-14" />
        <span className="mt-5 font-display text-sm font-bold uppercase tracking-[0.35em] text-white sm:text-base">
          {t('splash.title')}
        </span>

        <div className="mt-8 w-44 sm:w-56" aria-hidden="true">
          <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-deep via-accent to-accent-soft"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <span
          aria-live="polite"
          className="mt-6 font-display text-sm font-semibold tabular-nums text-accent-soft sm:text-base"
        >
          {percent}%
        </span>
      </div>

      <span className="absolute bottom-8 z-10 font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-white/45">
        {t('splash.skip')}
      </span>
    </div>
  );
};
