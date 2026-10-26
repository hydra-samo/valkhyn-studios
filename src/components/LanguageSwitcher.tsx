import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Lang } from '../i18n/translations';
import { cn } from '../lib/utils';

const OPTIONS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'fr', label: 'FR' },
  { id: 'ar', label: 'AR' },
];

/** Three-language switch. The active language is a filled emerald pill. */
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn('flex items-center gap-0.5 rounded-full border border-white/10 p-0.5', className)}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLang(o.id)}
          aria-pressed={lang === o.id}
          className={cn(
            'rounded-full px-2 py-1 font-sans text-[9px] font-semibold tracking-[0.12em] transition-colors duration-300',
            lang === o.id
              ? 'bg-accent/15 text-accent'
              : 'text-white/45 hover:text-white/80'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};
