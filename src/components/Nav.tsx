import React, { useEffect, useState } from 'react';
import { ValkhynLockup } from './ValkhynLockup';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../lib/utils';

const LINKS = [
  { href: '#home', key: 'nav.home' },
  { href: '#about', key: 'nav.about' },
  { href: '#services', key: 'nav.services' },
  { href: '#work', key: 'nav.work' },
  { href: '#process', key: 'nav.process' },
  { href: '#contact', key: 'nav.contact' },
];

export const Nav: React.FC = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');

  // Modal pattern: Escape dismisses the mobile sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Section-aware navigation: the active link carries a solid underline rule.
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-42% 0px -52% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <header className="glass-nav fixed inset-x-0 top-0 z-[70] pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="#home" className="flex shrink-0 items-center" aria-label="VALKHYN — home">
            <ValkhynLockup className="h-[16px] w-auto text-[var(--md-sys-color-on-surface)] sm:h-[18px]" />
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {LINKS.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'md3-state-layer relative rounded-full px-2.5 py-1.5 font-sans text-[13px] font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-[var(--chip-active)] text-[var(--md-sys-color-primary)]'
                      : 'text-[var(--md-sys-color-on-surface-soft)] hover:text-[var(--md-sys-color-on-surface)]'
                  )}
                >
                  {t(l.key)}
                </a>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <ThemeToggle />
            <LanguageSwitcher className="hidden sm:flex" />
            <a
              href="#contact"
              className="md3-button md3-button--filled md3-state-layer hidden rounded-full px-4 py-2 text-[12px] sm:inline-flex"
            >
              {t('nav.cta')}
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={t('nav.menu')}
              aria-expanded={open}
              className="md3-state-layer flex h-11 w-11 items-center justify-center rounded-full border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={cn(
                    'absolute left-0 top-0 h-px w-4 bg-current transition-[transform,opacity] duration-200',
                    open && 'translate-y-1.5 rotate-45'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1.5 h-px w-4 bg-current transition-[transform,opacity] duration-200',
                    open && 'opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-3 h-px w-4 bg-current transition-[transform,opacity] duration-200',
                    open && '-translate-y-1.5 -rotate-45'
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet: flat surface, solid scrim, no blur. The whole layer is
          hidden until the menu opens, so the scrim never darkens the page. */}
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-[65] transition-[opacity,visibility] duration-300 lg:hidden',
          open ? 'visible pointer-events-auto opacity-100' : 'invisible pointer-events-none opacity-0'
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[var(--md-sys-color-scrim)]"
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'glass-sheet absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-[var(--shape-editorial)] border border-[var(--md-sys-color-outline-variant)] px-6 pb-[max(3rem,env(safe-area-inset-bottom))] pt-8 transition-transform duration-300 md:mx-auto md:max-w-md md:rounded-[var(--shape-editorial)]',
            open ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'md3-state-layer border-b border-[var(--md-sys-color-outline-variant)] py-4 font-display text-2xl transition-colors duration-300',
                  active === l.href.slice(1)
                    ? 'text-[var(--md-sys-color-primary)]'
                    : 'text-[var(--md-sys-color-on-surface)]'
                )}
              >
                {t(l.key)}
              </a>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  );
};
