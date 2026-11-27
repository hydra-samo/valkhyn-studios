import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { EMAIL } from '../data/content';
import { useLanguage } from '../i18n/LanguageContext';

const DISCIPLINES = ['video', 'motion', 'voice', 'full'] as const;

/** Contact — closing statement and a flat, palette-safe mailto brief form. */
export const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [discipline, setDiscipline] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Project inquiry — ${name || 'New brief'}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nDiscipline: ${discipline || t('form.disc.video')}\n\n${message}`
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact" className="relative px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:py-36 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-16">
          <div className="flex flex-col md:col-span-6">
            <Reveal>
              <h2 className="heading-display text-4xl text-[var(--md-sys-color-on-surface)] sm:text-5xl md:text-6xl">
                {t('contact.lead')} <span className="text-[var(--md-sys-color-primary)]">{t('contact.accent')}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="md3-body mt-6 max-w-md text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)] sm:text-base">
                {t('contact.body')}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="md:col-span-5 md:col-start-8">
            <div className="brief-card">
              <form onSubmit={onSubmit} className="space-y-6">
                {sent ? (
                  <div className="py-10" aria-live="polite">
                    <h3 className="heading-display text-2xl text-[var(--md-sys-color-on-surface)]">
                      {t('form.sentTitle')}
                    </h3>
                    <p className="md3-body mt-3 text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                      {t('form.sentBody')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="name" className="brief-label md3-label">
                        {t('form.name')}
                      </label>
                      <input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="brief-field"
                        placeholder={t('form.namePh')}
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="brief-label md3-label">
                        {t('form.email')}
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="brief-field"
                        placeholder={t('form.emailPh')}
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label htmlFor="discipline" className="brief-label md3-label">
                        {t('form.discipline')}
                      </label>
                      <select
                        id="discipline"
                        value={discipline || t('form.disc.video')}
                        onChange={(e) => setDiscipline(e.target.value)}
                        className="brief-field"
                      >
                        {DISCIPLINES.map((d) => (
                          <option key={d} value={t(`form.disc.${d}`)}>
                            {t(`form.disc.${d}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="brief-label md3-label">
                        {t('form.message')}
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        required
                        className="brief-field resize-none"
                        placeholder={t('form.messagePh')}
                      />
                    </div>
                    <button
                      type="submit"
                      className="md3-button md3-button--filled md3-state-layer group mt-2 flex w-full items-center justify-between rounded-full active:scale-[0.99]"
                    >
                      {t('form.submit')}
                      <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </>
                )}
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
