import React from 'react';
import { motion } from 'framer-motion';
import { MobiusLoop } from './MobiusLoop';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="min-h-screen relative flex flex-col md:flex-row items-center justify-center p-4 md:p-8 overflow-hidden">

      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-light to-surface pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 flex-1 flex flex-col items-center md:items-start space-y-6 max-w-2xl text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl tracking-tight text-white mb-4 font-display font-bold">
            THE ABSURD<br />
            <span className="text-2xl sm:text-4xl md:text-6xl font-light text-accent italic">solution.</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-lg sm:text-2xl md:text-3xl text-muted font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          "Building what no one else would dare imagine."
        </motion.p>

        <motion.p
          className="text-base text-white/70 border-l-2 border-accent/40 pl-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Complexity is our simplicity.<br />(But slightly crazier.)
        </motion.p>

        <motion.a
          href="#contact"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 px-8 py-3 border border-accent/30 text-accent text-sm uppercase tracking-widest cursor-pointer inline-block rounded-full hover:bg-accent hover:text-black transition-all duration-300"
        >
          Catch Us If You Can
        </motion.a>
      </div>

      <div className="flex-1 flex justify-center items-center mt-12 md:mt-0">
        <MobiusLoop />
      </div>
    </section>
  );
};
