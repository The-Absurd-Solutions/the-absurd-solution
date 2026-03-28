import { useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Process } from './components/Process';
import { Contact } from './components/Contact';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkipToContent } from './components/SkipToContent';
import { Menu, X, Instagram, Twitter } from 'lucide-react';

const App: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="min-h-screen text-white selection:bg-accent selection:text-black bg-surface">
        {/* Skip to Content Link for Accessibility */}
        <SkipToContent targetId="main-content" />

        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] bg-accent origin-left z-50"
          style={{ scaleX }}
          role="progressbar"
          aria-label="Page scroll progress"
          aria-valuenow={0}
        />

        {/* Navigation */}
        <nav
          className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-5 flex justify-between items-center bg-surface/80 backdrop-blur-md border-b border-white/5"
          role="navigation"
          aria-label="Main navigation"
        >
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="text-2xl font-display font-bold tracking-tight hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
            aria-label="The Absurd Solution - Go to homepage"
          >
            ABSURD.
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10 text-sm tracking-widest">
            <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="text-muted hover:text-accent transition-colors whitespace-nowrap">SERVICES</a>
            <a href="#process" onClick={(e) => handleNavClick(e, '#process')} className="text-muted hover:text-accent transition-colors whitespace-nowrap">PROCESS</a>
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="px-5 py-2 border border-accent/30 text-accent rounded-full text-xs hover:bg-accent hover:text-black transition-all whitespace-nowrap">CONTACT</a>
          </div>

          {/* Mobile Nav Toggle */}
          <button
            className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface rounded p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <X size={28} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
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
              className="fixed top-18 left-0 right-0 bottom-0 bg-surface/95 backdrop-blur-lg z-30 flex flex-col items-center justify-center space-y-10 text-3xl font-display"
            >
              <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="text-muted hover:text-accent transition-colors">SERVICES</a>
              <a href="#process" onClick={(e) => handleNavClick(e, '#process')} className="text-muted hover:text-accent transition-colors">PROCESS</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-accent hover:text-white transition-colors">CONTACT</a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main id="main-content" className="relative z-10 pt-20" role="main">
          <Hero />
          <Services />
          <Process />
          <Contact />
        </main>

        {/* Footer */}
        <footer className="py-10 text-center border-t border-white/5 bg-surface" role="contentinfo">
          <a href="mailto:the@absurdsolution.com" className="text-accent hover:text-white font-display font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface" aria-label="Send email to the@absurdsolution.com">the@absurdsolution.com</a>

          {/* Social Links */}
          <ul className="flex justify-center gap-6 mt-5 list-none" aria-label="Social media links">
            <li>
              <a href="https://instagram.com/absurdsolution" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface rounded inline-block" aria-label="Follow us on Instagram">
                <Instagram size={20} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://twitter.com/absurdsolution" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface rounded inline-block" aria-label="Follow us on Twitter">
                <Twitter size={20} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://tiktok.com/@absurdsolution" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface rounded inline-block" aria-label="Follow us on TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
              </a>
            </li>
          </ul>

          <p className="mt-5 text-sm text-muted">&copy; {new Date().getFullYear()} The Absurd Solution. All wrongs reserved.</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
