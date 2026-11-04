import { lazy, Suspense, useEffect, useState } from 'react';
import { CodedBackground } from './components/CodedBackground';
import { useLenis } from './hooks/useLenis';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Work } from './components/Work';
import { Process } from './components/Process';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Splash } from './components/Splash';
import { Legal, type LegalKind } from './components/Legal';

const Dashboard = lazy(() => import('./dashboard/Dashboard'));

/** Legal pages are hash routes: static hosting, no server rewrite needed. */
const legalRoute = (): LegalKind | null => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#\/?/, '');
  return hash === 'legal' || hash === 'privacy' ? hash : null;
};

export default function App() {
  // Studio console — same always-on server, own route. Dev-server only: the
  // /api middleware that backs it (studio.plugin.mjs) does not ship in dist/.
  if (typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '').endsWith('/dashboard')) {
    return (
      <Suspense fallback={null}>
        <Dashboard />
      </Suspense>
    );
  }
  return <Site />;
}

function Site() {
  const [booted, setBooted] = useState(false);
  const [legal, setLegal] = useState<LegalKind | null>(legalRoute);
  useLenis();

  useEffect(() => {
    const sync = () => setLegal(legalRoute());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  if (legal) return <Legal kind={legal} />;

  return (
    <div className="grain relative min-h-[100dvh] bg-canvas text-text">
      {!booted && <Splash onComplete={() => setBooted(true)} />}

      {/* One continuous motion field behind the whole document */}
      <CodedBackground className="z-0" />
      <div className="relative z-10">
        <Nav />
        <main className="relative">
          <Hero />
          <About />
          <Services />
          <Work />
          <Process />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}
