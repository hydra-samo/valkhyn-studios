import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { EMAIL } from '../data/content';
import { useLanguage } from '../i18n/LanguageContext';

const DISCIPLINES = ['video', 'motion', 'voice', 'full'] as const;

/**
 * Contact — the final scene. Big type, real actions (mailto), no fake backend.
 * The form composes a real email so it works with zero configuration.
 */
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

  const field =
    'w-full border-b border-white/[0.12] bg-transparent pb-3 text-sm text-white placeholder:text-white/50 outline-none transition-colors duration-300 focus:border-accent';

  return (
    <section id="contact" className="relative overflow-hidden px-6 py-24 sm:px-10 md:px-14 md:py-36 lg:px-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute bottom-0 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          {/* Left — statement */}
          <div className="flex flex-col md:col-span-6">
            <Reveal>
              <h2 className="heading-display text-4xl text-white sm:text-5xl md:text-6xl">
                {t('contact.lead')} <span className="text-accent">{t('contact.accent')}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
                {t('contact.body')}
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-8 inline-flex items-center gap-3 font-display text-lg font-bold text-white transition-colors duration-300 hover:text-accent sm:text-xl"
              >
                {EMAIL}
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15">
                  <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
                </span>
              </a>
            </Reveal>

          </div>

          {/* Right — form */}
          <Reveal delay={0.1} className="md:col-span-5 md:col-start-8">
            <div className="bezel">
              <form onSubmit={onSubmit} className="bezel-core space-y-7 p-6 sm:p-8">
                {sent ? (
                  <div className="py-10 text-center">
                    <h3 className="heading-display text-2xl text-white">{t('form.sentTitle')}</h3>
                    <p className="mt-3 text-sm text-white/60">
                      {t('form.sentBody')}{' '}
                      <a href={`mailto:${EMAIL}`} className="text-accent">
                        {EMAIL}
                      </a>
                      .
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="name" className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                        {t('form.name')}
                      </label>
                      <input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={field}
                        placeholder={t('form.namePh')}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                        {t('form.email')}
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={field}
                        placeholder="you@studio.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="discipline" className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                        {t('form.discipline')}
                      </label>
                      <select
                        id="discipline"
                        value={discipline || t('form.disc.video')}
                        onChange={(e) => setDiscipline(e.target.value)}
                        className={field}
                      >
                        {DISCIPLINES.map((d) => (
                          <option key={d} value={t(`form.disc.${d}`)}>
                            {t(`form.disc.${d}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                        {t('form.message')}
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className={`${field} resize-none`}
                        placeholder={t('form.messagePh')}
                      />
                    </div>
                    <button
                      type="submit"
                      className="cta-glass group flex w-full items-center justify-between rounded-full px-6 py-3.5 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] active:scale-[0.99]"
                    >
                      {t('form.submit')}
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/25 transition-transform duration-500 group-hover:translate-x-1">
                        <ArrowRight size={12} strokeWidth={2} aria-hidden="true" />
                      </span>
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
