import { useState } from 'react';
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

export default function App() {
  const [booted, setBooted] = useState(false);
  useLenis();

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
