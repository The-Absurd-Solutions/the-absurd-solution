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
    <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">

      {/* The Loop Path */}
      <svg viewBox="0 0 200 100" className="w-full h-full absolute overflow-visible">

        {/* Infinite Figure 8 */}
        <motion.path
          d="M20,50 C20,-50 180,-50 180,50 C180,150 20,150 20,50"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />

        <motion.path
          d="M22,51 C22,-48 178,-48 178,51 C178,148 22,148 22,51"
          fill="none"
          stroke="rgba(74,222,128,0.15)"
          strokeWidth="0.5"
          strokeDasharray="4 2"
          animate={{ strokeDashoffset: [0, 100] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Phase labels at cardinal points */}
        {phases.map((phase, i) => {
          const positions = [
            { x: 20, y: 50 },
            { x: 100, y: -14 },
            { x: 180, y: 50 },
            { x: 100, y: 114 },
          ];
          const pos = positions[i];
          return (
            <motion.text
              key={phase.word}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              fontSize="7"
              fontWeight={activePhase === i ? "700" : "400"}
              fill={activePhase === i ? "#4ade80" : "rgba(255,255,255,0.15)"}
              animate={{
                opacity: activePhase === i ? 1 : 0.3,
              }}
              transition={{ duration: 0.4 }}
            >
              {phase.word}
            </motion.text>
          );
        })}

        {/* Particle */}
        <motion.circle r="2" fill="#4ade80" opacity="0.6">
          <animateMotion
            path="M20,50 C20,-50 180,-50 180,50 C180,150 20,150 20,50"
            dur="10s"
            repeatCount="indefinite"
          />
        </motion.circle>
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
            <span className="text-lg md:text-2xl font-display font-bold text-white tracking-tight block">
              {phases[activePhase].word}
            </span>
            <span className="text-[10px] md:text-xs text-muted tracking-widest uppercase">
              {phases[activePhase].sub}
            </span>
          </motion.div>
        </AnimatePresence>

        <span className="text-[8px] md:text-[10px] text-white/15 mt-2 tracking-[0.3em] uppercase">
          the loop is closed
        </span>
      </div>
    </div>
  );
};
