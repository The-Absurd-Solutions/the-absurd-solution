import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const phases = [
  { word: "ENVISION", sub: "design / strategy / branding" },
  { word: "CRAFT", sub: "websites / digital presence" },
  { word: "ENGINEER", sub: "saas / full-stack platforms" },
  { word: "AUTOMATE", sub: "devops / pipelines / cloud" },
];

export const MobiusLoop: React.FC = () => {
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % phases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

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

        {/* Phase labels at cardinal points of the loop */}
        {phases.map((phase, i) => {
          const positions = [
            { x: 20, y: 50 },   // left
            { x: 100, y: -14 }, // top
            { x: 180, y: 50 },  // right
            { x: 100, y: 114 }, // bottom
          ];
          const pos = positions[i];
          return (
            <motion.text
              key={phase.word}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              className="font-mono"
              fontSize="7"
              fontWeight={activePhase === i ? "900" : "400"}
              fill="#000"
              animate={{
                opacity: activePhase === i ? 1 : 0.15,
              }}
              transition={{ duration: 0.4 }}
            >
              {phase.word}
            </motion.text>
          );
        })}

        {/* Scribble Particle */}
        <motion.rect width="4" height="4" fill="#000">
          <animateMotion
            path="M20,50 C20,-50 180,-50 180,50 C180,150 20,150 20,50"
            dur="10s"
            repeatCount="indefinite"
          />
        </motion.rect>
      </svg>

      {/* Central cycling text */}
      <div className="absolute flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <span className="text-lg md:text-2xl font-black text-black tracking-tighter block">
              {phases[activePhase].word}
            </span>
            <span className="text-[10px] md:text-xs font-mono text-gray-500 tracking-widest uppercase">
              {phases[activePhase].sub}
            </span>
          </motion.div>
        </AnimatePresence>

        <span className="text-[8px] md:text-[10px] font-mono text-black/30 mt-2 tracking-[0.3em] uppercase">
          the loop is closed
        </span>
      </div>
    </div>
  );
};
