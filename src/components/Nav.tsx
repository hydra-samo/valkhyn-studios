import React, { useEffect, useState } from 'react';
import { ValkhynLockup } from './ValkhynLockup';
import { LanguageSwitcher } from './LanguageSwitcher';
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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Section-aware nav: the active link lights up with its own underline sweep.
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
      <header className="fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-3 sm:px-6">
        <div
          className={cn(
            'flex w-full max-w-5xl items-center justify-between rounded-full px-3 py-1.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-4',
            scrolled
              ? 'border border-white/10 bg-black/60 backdrop-blur-2xl'
              : 'border border-white/[0.06] bg-white/[0.02] backdrop-blur-md'
          )}
        >
          <a href="#home" className="flex items-center gap-2" aria-label="VALKHYN — home">
            <ValkhynLockup className="h-[15px] w-auto text-white sm:h-[17px]" />
          </a>

          <nav className="hidden items-center gap-6 lg:flex">
            {LINKS.map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'relative font-sans text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-500',
                    isActive ? 'text-accent' : 'text-white/50 hover:text-white'
                  )}
                >
                  {t(l.key)}
                  <span
                    className={cn(
                      'absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                      isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                    )}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher className="hidden sm:flex" />
            <a
              href="#contact"
              className="cta-glass hidden rounded-full px-3.5 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] sm:inline-flex"
            >
              {t('nav.cta')}
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={t('nav.menu')}
              aria-expanded={open}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={cn(
                    'absolute left-0 top-0 h-px w-4 bg-current transition-all duration-300',
                    open && 'top-1.5 rotate-45'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1.5 h-px w-4 bg-current transition-all duration-300',
                    open && 'opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-3 h-px w-4 bg-current transition-all duration-300',
                    open && 'top-1.5 -rotate-45'
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[65] flex flex-col justify-center gap-2 bg-black/90 px-8 backdrop-blur-3xl transition-all duration-500 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        {LINKS.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="heading-display border-b border-white/10 py-4 text-4xl text-white/80 transition-colors duration-300 hover:text-accent"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            {t(l.key)}
          </a>
        ))}
        <LanguageSwitcher className="mt-6 self-start" />
      </div>
    </>
  );
};
