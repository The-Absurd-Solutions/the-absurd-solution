import React from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "", as: Component = "span" }) => {
  return (
    <Component className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute top-0 left-0 -z-10 text-accent/0 group-hover:text-accent/30"
        animate={{ x: [-1, 1, 0], y: [0.5, -0.5, 0] }}
        transition={{ repeat: Infinity, duration: 0.15, repeatType: "mirror" }}
      >
        {text}
      </motion.span>
    </Component>
  );
};
