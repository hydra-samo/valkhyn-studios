import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BriefFormData } from '../types';
import { MagneticButton } from './MagneticButton';
import { Reveal } from './motion/Reveal';
import { cn } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';

const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;
const FORM_ACCESS_KEY = import.meta.env.VITE_FORM_ACCESS_KEY as string | undefined;
const isFormConfigured = Boolean(FORM_ENDPOINT);

interface ContactSectionProps {
  onCloseModal: () => void;
}

/**
 * Contact — the final scene of the film.
 * Concentrated emerald light, oversized typography, and the brief form.
 * The section itself IS the contact area — no separate modal needed
 * (the modal still works for the "Start Project" button in the nav).
 */
export const ContactSection: React.FC<ContactSectionProps> = ({ onCloseModal }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<BriefFormData>({
    clientName: '',
    clientEmail: '',
    companyName: '',
    services: ['video'],
    budget: '$1,000 - $3,000',
    timeline: '1-2 Weeks',
    projectOverview: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCloseModal]);

  const buildPayload = () => ({
    ...formData,
    subject: `New Project Brief from ${formData.clientName}${
      formData.companyName ? ` (${formData.companyName})` : ''
    }`,
    ...(FORM_ACCESS_KEY ? { access_key: FORM_ACCESS_KEY } : {}),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.clientName.trim() || !formData.clientEmail.trim()) {
      setFormError('Name and email are required.');
      return;
    }

    if (!isFormConfigured) {
      setFormError('Form endpoint not configured. Set VITE_FORM_ENDPOINT in your .env file.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setIsSubmitting(false);
      setFormError('Failed to send. Please try again.');
    }
  };

  const glassInput =
    'w-full bg-white/[0.04] border border-white/[0.06] focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl px-4 py-3.5 text-base text-white outline-none transition-all shadow-none backdrop-blur-md placeholder:text-white/25';

  const glassSelect = cn(glassInput, 'cursor-pointer');

  const fieldLabel =
    'block text-xs uppercase tracking-widest text-white/40 mb-2 font-medium';

  const SelectField: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }> = ({ value, onChange, options }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={glassSelect}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <section
      id="contact"
      data-section="contact"
      className="relative py-24 sm:py-32 md:py-44 px-5 sm:px-8 lg:px-12 overflow-hidden"
    >
      {/* Concentrated emerald glow — the light converges here */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/[0.06] blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-accent/[0.04] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl relative z-10">
        {/* ── Section Header ──────────────────────────────────────────────── */}
        <Reveal cinematic className="text-center mb-12 sm:mb-16">
          <span className="label-cinematic block mb-4">GET IN TOUCH</span>
          <h2 className="heading-cinematic text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6">
            LET&apos;S <span className="text-accent">CREATE</span>
          </h2>
          <p className="text-base sm:text-lg text-white/40 max-w-xl mx-auto">
            {t('hero.description')}
          </p>
        </Reveal>

        {/* ── Contact Form ─────────────────────────────────────────────────── */}
        <Reveal delay={0.15} cinematic>
          <div className="glass-modal rounded-[28px] p-6 sm:p-8 md:p-10">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <h3 className="text-2xl font-medium tracking-tight uppercase font-display text-white mb-4">
                  Brief Received
                </h3>
                <p className="text-base text-white/40 mb-8 leading-relaxed">
                  Thank you, <strong className="text-white/80">{formData.clientName}</strong>. I&apos;ll review your brief and get back to you within 24 hours.
                </p>
                <MagneticButton
                  onClick={() => {
                    setSubmitted(false);
                    onCloseModal();
                  }}
                  className="px-8 py-3.5 min-h-[44px] bg-white/[0.05] border border-accent/20 text-white hover:bg-white/10 font-semibold text-sm uppercase tracking-wider rounded-full transition-all hover:shadow-[0_0_25px_rgba(0,168,107,0.15)]"
                >
                  Send Another Brief
                </MagneticButton>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={fieldLabel}>Service</label>
                  <SelectField
                    value={formData.services[0]}
                    onChange={(v) => setFormData((prev) => ({ ...prev, services: [v] }))}
                    options={[
                      { value: 'video', label: 'Video Editing' },
                      { value: 'motion', label: 'Motion Design' },
                      { value: 'voice', label: 'Voice Over' },
                      { value: 'full', label: 'Full Package' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={fieldLabel}>Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className={glassInput}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className={glassInput}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={fieldLabel}>Budget</label>
                    <SelectField
                      value={formData.budget}
                      onChange={(v) => setFormData({ ...formData, budget: v })}
                      options={[
                        { value: '< $1,000', label: 'Under $1,000' },
                        { value: '$1,000 - $3,000', label: '$1,000 - $3,000' },
                        { value: '$3,000 - $7,000', label: '$3,000 - $7,000' },
                        { value: '$7,000+', label: '$7,000+' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Timeline</label>
                    <SelectField
                      value={formData.timeline}
                      onChange={(v) => setFormData({ ...formData, timeline: v })}
                      options={[
                        { value: 'ASAP (< 7 Days)', label: 'ASAP' },
                        { value: '1-2 Weeks', label: '1-2 Weeks' },
                        { value: '3-4 Weeks', label: '3-4 Weeks' },
                        { value: 'Flexible', label: 'Flexible' },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className={fieldLabel}>Project Overview</label>
                  <textarea
                    rows={4}
                    placeholder="Tell me about your project..."
                    value={formData.projectOverview}
                    onChange={(e) => setFormData({ ...formData, projectOverview: e.target.value })}
                    className={cn(glassInput, 'resize-none')}
                  />
                </div>

                {!isFormConfigured && (
                  <div className="flex items-center gap-2.5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium">
                    <span>
                      Configure{' '}
                      <code className="px-1.5 py-0.5 rounded-md bg-white/10 font-semibold">
                        VITE_FORM_ENDPOINT
                      </code>{' '}
                      in your .env file to enable form submissions.
                    </span>
                  </div>
                )}
                {formError && (
                  <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-600/10 border border-red-600/30 text-red-400 text-sm font-medium">
                    <span>{formError}</span>
                  </div>
                )}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                >
                  <MagneticButton
                    type="submit"
                    disabled={isSubmitting || !isFormConfigured}
                    className="w-full py-5 min-h-[48px] bg-white/[0.05] border border-accent/20 text-white hover:bg-white/10 font-semibold text-base sm:text-lg uppercase tracking-wider rounded-2xl transition-all hover:shadow-[0_0_25px_rgba(0,168,107,0.15)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span>Transmitting...</span>
                    ) : isFormConfigured ? (
                      <span>Send Brief</span>
                    ) : (
                      <span>Form Not Configured</span>
                    )}
                  </MagneticButton>
                </motion.div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
