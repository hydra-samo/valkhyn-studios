import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { motion, MotionConfig, AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './i18n/LanguageContext';
import { MotionStoreProvider, HydraMotionEngine } from './lib/motionEngine';
import { useDeviceTier } from './hooks/useDeviceTier';
import ATMOSPHERE from './data/atmosphere.json';

const Dashboard = React.lazy(() => import('./dashboard/Dashboard'));
import { PreSplashSelector } from './components/PreSplash';
import { LoadingSplash } from './components/LoadingSplash';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { PersistentPortrait } from './components/PersistentPortrait';
import { CustomCursor } from './components/CustomCursor';
import { ProgressRail } from './components/ProgressRail';
import { useLenis } from './hooks/useLenis';

const ProjectsSection = React.lazy(() =>
  import('./components/ProjectsSection').then((m) => ({ default: m.ProjectsSection }))
);
const AboutSection = React.lazy(() =>
  import('./components/AboutSection').then((m) => ({ default: m.AboutSection }))
);
const ServicesSection = React.lazy(() =>
  import('./components/ServicesSection').then((m) => ({ default: m.ServicesSection }))
);
const ContactSection = React.lazy(() =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }))
);
const Footer = React.lazy(() =>
  import('./components/Footer').then((m) => ({ default: m.Footer }))
);

const SectionFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
  </div>
);

type SplashPhase = 'presplash' | 'loading' | 'done';

function AppInner() {
  const lenisRef = useLenis();
  const deviceTier = useDeviceTier();

  const [splashPhase, setSplashPhase] = useState<SplashPhase>(() => {
    if (typeof window === 'undefined') return 'presplash';
    return sessionStorage.getItem('hydra-splash-done') === '1' ? 'done' : 'presplash';
  });

  const [isOpenBriefModal, setIsOpenBriefModal] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (isOpenBriefModal) {
      document.body.style.overflow = 'hidden';
      lenisRef.current?.stop();
    } else {
      document.body.style.overflow = '';
      lenisRef.current?.start();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpenBriefModal, lenisRef]);

  const handlePreSplashComplete = useCallback(() => {
    setSplashPhase('loading');
  }, []);

  const handleLoadingComplete = useCallback(() => {
    sessionStorage.setItem('hydra-splash-done', '1');
    setSplashPhase('done');
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {/* Splash screens */}
      <AnimatePresence mode="wait">
        {splashPhase === 'presplash' && (
          <PreSplashSelector key="pre" onComplete={handlePreSplashComplete} />
        )}
        {splashPhase === 'loading' && (
          <LoadingSplash key="load" onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {/* Main content — continuous cinematic flow */}
      {splashPhase === 'done' && (
        <MotionStoreProvider lenisRef={lenisRef}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Film grain overlay — subtle texture across the entire canvas */}
              {ATMOSPHERE.grain && <div className="film-grain" aria-hidden="true" />}

              {/* Fixed atmospheric background */}
              <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/background/background.jpeg)' }}
                aria-hidden="true"
              />

              {/* HYDRA Motion Engine — video atmosphere layers */}
              <HydraMotionEngine deviceTier={deviceTier} />

            {/* Scroll-synced persistent portrait — full viewport canvas */}
            <PersistentPortrait />

            {/* ── Hero: Opening Frame ──────────────────────────────────────── */}
            <Hero />

            {/* ── Floating Navigation ──────────────────────────────────────── */}
            <Navigation
              onOpenBrief={() => setIsOpenBriefModal(true)}
            />

            {/* ── Craft layer ─────────────────────────────────────────────── */}
            <CustomCursor />
            <ProgressRail />

            {/* ── Continuous Content Flow ──────────────────────────────────── */}
            <main className="relative z-10">
              {/* About — Origin Story */}
              <div className="section-blend-content">
                <Suspense fallback={<SectionFallback />}>
                  <AboutSection />
                </Suspense>
              </div>

              {/* Work — Selected Projects + Voice */}
              <div className="section-blend-content">
                <Suspense fallback={<SectionFallback />}>
                  <ProjectsSection />
                </Suspense>
              </div>

              {/* Services — Process */}
              <div className="section-blend-services">
                <Suspense fallback={<SectionFallback />}>
                  <ServicesSection />
                </Suspense>
              </div>

              {/* Contact — Final Scene */}
              <div className="section-blend-contact">
                <Suspense fallback={<SectionFallback />}>
                  <ContactSection onCloseModal={() => setIsOpenBriefModal(false)} />
                </Suspense>
              </div>

              {/* Footer */}
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
            </main>
            </motion.div>
          </MotionStoreProvider>
      )}
    </MotionConfig>
  );
}

export default function App() {
  // Studio console route — served by the same always-on local server
  if (typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '').endsWith('/dashboard')) {
    return (
      <Suspense fallback={null}>
        <Dashboard />
      </Suspense>
    );
  }
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
