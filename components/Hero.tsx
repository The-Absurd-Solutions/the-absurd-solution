import React from 'react';
import { motion } from 'framer-motion';
import { MobiusLoop } from './MobiusLoop';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="min-h-screen relative flex flex-col md:flex-row items-center justify-center p-8 overflow-hidden">

      {/* Background Scribbles */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <motion.path d="M50,50 Q100,10 150,50 T250,50" stroke="black" fill="none" strokeWidth="2"
          animate={{ d: ["M50,50 Q100,10 150,50 T250,50", "M50,55 Q100,15 150,55 T250,55"] }}
          transition={{ repeat: Infinity, repeatType: "mirror", duration: 2 }}
        />
        <motion.circle cx="80%" cy="20%" r="50" stroke="black" fill="none" strokeWidth="1"
          className="ink-effect"
        />
      </svg>

      <div className="z-10 flex-1 flex flex-col items-center md:items-start space-y-6 max-w-2xl text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-6xl md:text-8xl tracking-tighter text-black mb-4 ink-effect">
            THE ABSURD<br />
            <span className="text-4xl md:text-6xl font-sans italic">solution.</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-2xl md:text-3xl text-[#333] transform -rotate-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          "Building what no one else would dare imagine."
        </motion.p>

        <motion.p
          className="text-lg font-bold text-black border-l-2 border-black pl-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Complexity is our simplicity.<br />(But slightly crazier.)
        </motion.p>

        <motion.a
          href="#contact"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-8 py-3 sketch-box text-xl uppercase tracking-widest cursor-pointer inline-block"
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