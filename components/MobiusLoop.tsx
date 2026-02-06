import React from 'react';
import { motion } from 'framer-motion';

export const MobiusLoop: React.FC = () => {
  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center ink-effect">
      
      {/* The Loop Path - Sketchy Black Line */}
      <svg viewBox="0 0 200 100" className="w-full h-full absolute overflow-visible">
        
        {/* Infinite Figure 8 - Multiple strokes for sketchy look */}
        <motion.path
          d="M20,50 C20,-50 180,-50 180,50 C180,150 20,150 20,50"
          fill="none"
          stroke="#000"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        
        <motion.path
          d="M22,51 C22,-48 178,-48 178,51 C178,148 22,148 22,51"
          fill="none"
          stroke="#000"
          strokeWidth="0.5"
          strokeDasharray="4 2"
          animate={{ strokeDashoffset: [0, 100] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Scribble Particle */}
        <motion.rect width="4" height="4" fill="#000">
           <animateMotion 
             path="M20,50 C20,-50 180,-50 180,50 C180,150 20,150 20,50"
             dur="5s"
             repeatCount="indefinite"
           />
        </motion.rect>
      </svg>
      
      {/* Central text */}
      <motion.div 
        className="absolute text-sm font-bold text-black"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        THE LOOP IS CLOSED
      </motion.div>
    </div>
  );
};