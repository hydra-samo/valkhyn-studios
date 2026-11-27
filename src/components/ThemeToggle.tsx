import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../lib/utils';

/** Flat, icon-only theme switch. The label always describes the next action. */
export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const label = theme === 'dark' ? t('theme.toLight') : t('theme.toDark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'md3-state-layer flex h-11 w-11 items-center justify-center rounded-full border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] transition-colors duration-300 hover:text-[var(--md-sys-color-primary)] lg:h-9 lg:w-9',
        className
      )}
    >
      {theme === 'dark' ? (
        <Sun size={16} strokeWidth={1.6} aria-hidden="true" />
      ) : (
        <Moon size={16} strokeWidth={1.6} aria-hidden="true" />
      )}
    </button>
  );
};
