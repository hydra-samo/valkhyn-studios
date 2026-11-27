import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Lang } from '../i18n/translations';
import { cn } from '../lib/utils';

const OPTIONS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'fr', label: 'FR' },
  { id: 'ar', label: 'AR' },
];

/** Flat three-language switch with a solid active state. */
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className={cn(
        'flex items-center gap-0.5 rounded-full border border-[var(--md-sys-color-outline-variant)] p-0.5',
        className
      )}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLang(o.id)}
          aria-pressed={lang === o.id}
          className={cn(
            'md3-state-layer flex min-h-11 items-center rounded-full px-3 font-sans text-[10px] font-semibold tracking-[0.12em] transition-colors duration-200 lg:min-h-0 lg:px-2.5 lg:py-1',
            lang === o.id
              ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
              : 'text-[var(--md-sys-color-on-surface-soft)] hover:text-[var(--md-sys-color-on-surface)]'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};
