import React from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "", as: Component = "span" }) => {
  return (
    <Component className={`relative inline-block group ink-effect ${className}`}>
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute top-0 left-0 -z-10 text-gray-400 opacity-0 group-hover:opacity-100"
        animate={{ x: [-2, 2, -1, 0], y: [1, -1, 0] }}
        transition={{ repeat: Infinity, duration: 0.1, repeatType: "mirror" }}
      >
        {text}
      </motion.span>
      <motion.span
        className="absolute top-0 left-0 -z-10 text-black opacity-0 group-hover:opacity-50"
        animate={{ x: [2, -2, 1, 0], y: [-1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.2, repeatType: "mirror" }}
      >
        {text}
      </motion.span>
    </Component>
  );
};