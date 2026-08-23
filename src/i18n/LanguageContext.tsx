import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Lang, UI } from './translations';
export type { Lang };

const LANG_KEY = 'hydra-lang';

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(LANG_KEY);
  if (saved === 'en' || saved === 'fr' || saved === 'ar') return saved;
  return 'en';
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(detectLang);

  // Keep <html> in sync: lang attribute, writing direction, and the class that
  // switches to the Arabic font stack.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    root.classList.toggle('lang-ar', lang === 'ar');
    window.localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  const t = (key: string, vars?: Record<string, string | number>) => {
    const template = UI[lang][key] ?? UI.en[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in vars ? String(vars[name]) : match
    );
  };

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t, dir: lang === 'ar' ? 'rtl' : 'ltr' }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
