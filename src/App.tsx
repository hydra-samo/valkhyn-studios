import { useEffect, useState } from 'react';
import { useLenis } from './hooks/useLenis';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Work } from './components/Work';
import { Process } from './components/Process';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Legal, type LegalKind } from './components/Legal';

/** Legal pages are hash routes: static hosting, no server rewrite needed. */
const legalRoute = (): LegalKind | null => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#\/?/, '');
  return hash === 'legal' || hash === 'privacy' ? hash : null;
};

export default function App() {
  return <Site />;
}

function Site() {
  const [legal, setLegal] = useState<LegalKind | null>(legalRoute);
  useLenis();

  useEffect(() => {
    const sync = () => setLegal(legalRoute());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  if (legal) return <Legal kind={legal} />;

  return (
    <div className="relative min-h-[100dvh] bg-canvas text-text">
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
  );
}
