import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Hero } from './components/Hero';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkipToContent } from './components/SkipToContent';
import { Menu, X, Instagram, Twitter } from 'lucide-react';

// Lazy load components below the fold
const About = lazy(() => import('./components/About').then(m => ({ default: m.About })));
const Services = lazy(() => import('./components/Services').then(m => ({ default: m.Services })));
const Process = lazy(() => import('./components/Process').then(m => ({ default: m.Process })));
const Portfolio = lazy(() => import('./components/Portfolio').then(m => ({ default: m.Portfolio })));
const Contact = lazy(() => import('./components/Contact').then(m => ({ default: m.Contact })));

const App: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setTimeout(() => setIsLoading(false), 300);
    });
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ErrorBoundary>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen text-black selection:bg-black selection:text-white bg-white">
        {/* Skip to Content Link for Accessibility */}
        <SkipToContent targetId="main-content" />

        {/* Progress Bar - Ink Line */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-2 bg-black origin-left z-50 ink-effect"
          style={{ scaleX }}
          role="progressbar"
          aria-label="Page scroll progress"
          aria-valuenow={0}
        />

        {/* Navigation */}
        <nav
          className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center bg-white/90 backdrop-blur-sm border-b border-black/10"
          role="navigation"
          aria-label="Main navigation"
        >
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="text-3xl font-bold tracking-tighter hover:scale-105 transition-transform duration-300 ease-in-out origin-left focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="The Absurd Solution - Go to homepage"
          >
            ABSURD.
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 font-bold text-lg tracking-widest">
            <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="hover:underline decoration-2 decoration-black underline-offset-4 whitespace-nowrap">ABOUT</a>
            <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="hover:underline decoration-2 decoration-black underline-offset-4 whitespace-nowrap">SERVICES</a>
            <a href="#process" onClick={(e) => handleNavClick(e, '#process')} className="hover:underline decoration-2 decoration-black underline-offset-4 whitespace-nowrap">PROCESS</a>
            <a href="#work" onClick={(e) => handleNavClick(e, '#work')} className="hover:underline decoration-2 decoration-black underline-offset-4 whitespace-nowrap">WORK</a>
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="hover:underline decoration-2 decoration-black underline-offset-4 whitespace-nowrap">CONTACT</a>
          </div>

          {/* Mobile Nav Toggle */}
          <button
            className="md:hidden text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <X size={32} aria-hidden="true" /> : <Menu size={32} aria-hidden="true" />}
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-18 left-0 right-0 bottom-0 bg-white z-30 flex flex-col items-center justify-center space-y-8 text-4xl font-bold"
            >
              <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">ABOUT</a>
              <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">SERVICES</a>
              <a href="#process" onClick={(e) => handleNavClick(e, '#process')} className="focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">PROCESS</a>
              <a href="#work" onClick={(e) => handleNavClick(e, '#work')} className="focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">WORK</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">CONTACT</a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main id="main-content" className="relative z-10 pt-20" role="main">
          <Hero />
          <Suspense fallback={<div className="min-h-screen" />}>
            <About />
            <Services />
            <Process />
            <Portfolio />
            <Contact />
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-lg text-gray-500 border-t-2 border-black bg-white" role="contentinfo">
          <a href="mailto:the@absurdsolution.com" className="text-black hover:underline font-bold focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2" aria-label="Send email to the@absurdsolution.com">the@absurdsolution.com</a>

          {/* Social Links */}
          <ul className="flex justify-center gap-6 mt-4 list-none" aria-label="Social media links">
            <li>
              <a href="https://instagram.com/absurdsolution" target="_blank" rel="noopener noreferrer" className="text-black hover:scale-110 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded inline-block" aria-label="Follow us on Instagram">
                <Instagram size={24} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://twitter.com/absurdsolution" target="_blank" rel="noopener noreferrer" className="text-black hover:scale-110 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded inline-block" aria-label="Follow us on Twitter">
                <Twitter size={24} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://tiktok.com/@absurdsolution" target="_blank" rel="noopener noreferrer" className="text-black hover:scale-110 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded inline-block" aria-label="Follow us on TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
              </a>
            </li>
          </ul>

          <p className="mt-4">&copy; {new Date().getFullYear()} The Absurd Solution. All wrongs reserved.</p>
          <p className="text-sm mt-2">Built with Ink & React.</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;