import React, { useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Process } from './components/Process';
import { Portfolio } from './components/Portfolio';
import { Contact } from './components/Contact';
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
    <div className="min-h-screen text-black selection:bg-black selection:text-white bg-white">
      {/* Progress Bar - Ink Line */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-2 bg-black origin-left z-50 ink-effect"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center bg-white/90 backdrop-blur-sm border-b border-black/10">
        <a 
          href="#home" 
          onClick={(e) => handleNavClick(e, '#home')}
          className="text-3xl font-bold tracking-tighter hover:scale-105 transition-transform origin-left"
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
        <button className="md:hidden text-black" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[72px] left-0 right-0 bottom-0 bg-white z-30 flex flex-col items-center justify-center space-y-8 text-4xl font-bold"
          >
              <a href="#about" onClick={(e) => handleNavClick(e, '#about')}>ABOUT</a>
              <a href="#services" onClick={(e) => handleNavClick(e, '#services')}>SERVICES</a>
              <a href="#process" onClick={(e) => handleNavClick(e, '#process')}>PROCESS</a>
              <a href="#work" onClick={(e) => handleNavClick(e, '#work')}>WORK</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>CONTACT</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 pt-20">
        <Hero />
        <About />
        <Services />
        <Process />
        <Portfolio />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-lg text-gray-500 border-t-2 border-black bg-white">
        <a href="mailto:the@absurdsolution.com" className="text-black hover:underline font-bold">the@absurdsolution.com</a>
        
        {/* Social Links */}
        <div className="flex justify-center gap-6 mt-4">
          <a href="https://instagram.com/absurdsolution" target="_blank" rel="noopener noreferrer" className="text-black hover:scale-110 transition-transform">
            <Instagram size={24} />
          </a>
          <a href="https://twitter.com/absurdsolution" target="_blank" rel="noopener noreferrer" className="text-black hover:scale-110 transition-transform">
            <Twitter size={24} />
          </a>
          <a href="https://tiktok.com/@absurdsolution" target="_blank" rel="noopener noreferrer" className="text-black hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
          </a>
        </div>
        
        <p className="mt-4">&copy; {new Date().getFullYear()} The Absurd Solution. All wrongs reserved.</p>
        <p className="text-sm mt-2">Built with Ink & React.</p>
      </footer>
    </div>
  );
};

export default App;