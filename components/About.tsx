import React from 'react';
import { motion } from 'framer-motion';
import { TeamMember } from '../types';
import { GlitchText } from './GlitchText';

const team: TeamMember[] = [
  {
    id: 'mila',
    name: "Mila Dobric",
    role: "Product & Strategy",
    description: "Turns vague ideas into real products. She owns the roadmap, runs the sprints, and makes sure what we build actually solves the right problem.",
    image: "/images/mila.png",
    quirk: "Prioritizes backlogs with telepathy."
  },
  {
    id: 'dino',
    name: "Dino Bata",
    role: "Full-Stack Engineering",
    description: "Builds everything from pixel-perfect interfaces to rock-solid APIs. React, Node, databases, cloud — if it's code, he ships it.",
    image: "/images/dino.png",
    quirk: "His tests pass in parallel dimensions."
  },
  {
    id: 'vesna',
    name: "Vesna Bozic",
    role: "DevOps & Infrastructure",
    description: "Architects the cloud, automates the pipelines, and keeps systems alive at scale. AWS, IaC, CI/CD — she makes deployment boring on purpose.",
    image: "/images/vesna.png",
    quirk: "Her runbooks read like ancient prophecies."
  }
];

export const About: React.FC = () => {
  return (
    <section id="about" className="min-h-screen py-20 md:py-40 px-4 relative overflow-hidden bg-white">

      {/* Background Scribbles & Noise */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full">
          <filter id="noise_static">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise_static)" />
        </svg>
      </div>

      {/* Giant Background Text Stroke */}
      <div className="absolute top-20 left-0 w-full text-[20vw] leading-none font-black text-black opacity-[0.03] select-none pointer-events-none overflow-hidden whitespace-nowrap">
        ARCHITECTS
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 md:mb-40 md:text-left text-center pl-0 md:pl-20">
          <h2 className="text-4xl sm:text-6xl md:text-9xl text-black tracking-tighter mix-blend-multiply opacity-90 -rotate-2 inline-block relative">
            <GlitchText text="THE ARCHITECTS" />
            <div className="absolute -bottom-4 left-0 w-full h-2 bg-black skew-x-12"></div>
          </h2>
          <div className="flex items-center gap-4 mt-8 justify-center md:justify-start">
            <div className="h-px w-20 bg-black"></div>
            <p className="font-mono text-sm tracking-[0.2em] uppercase">
                    // Strategy. Code. Infrastructure.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-12 md:gap-12 relative">

          {/* Chaotic Connecting Line */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block -z-10 overflow-visible opacity-30">
            <path d="M150,100 Q400,0 550,200 T900,150" fill="none" stroke="black" strokeWidth="2" strokeDasharray="10,5" />
            <path d="M160,110 L200,300" fill="none" stroke="black" strokeWidth="1" />
            <path d="M550,200 L600,400" fill="none" stroke="black" strokeWidth="1" />
          </svg>

          {team.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 100, rotate: index % 2 === 0 ? -5 : 5 }}
              whileInView={{ opacity: 1, y: 0, rotate: index === 0 ? -3 : index === 1 ? 2 : -4 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2, type: "spring", bounce: 0.3 }}
              className={`relative group w-full max-w-sm ${index === 1 ? 'md:mt-32' : ''}`}
            >

              {/* Image Container - ROUGH CUT / JAGGED */}
              <div className="relative mb-6">
                {/* Black backing for offset effect */}
                <div
                  className="absolute inset-0 bg-black transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2"
                  style={{
                    clipPath: index === 0
                      ? "polygon(0 0, 100% 5%, 95% 100%, 5% 95%)"
                      : index === 1
                        ? "polygon(5% 0, 95% 0, 100% 90%, 0% 100%)"
                        : "polygon(2% 2%, 98% 0, 100% 98%, 0 95%)"
                  }}
                ></div>

                {/* The Image Itself */}
                <div
                  className="relative h-96 w-full overflow-hidden grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500"
                  style={{
                    clipPath: index === 0
                      ? "polygon(0 0, 100% 5%, 95% 100%, 5% 95%)"
                      : index === 1
                        ? "polygon(5% 0, 95% 0, 100% 90%, 0% 100%)"
                        : "polygon(2% 2%, 98% 0, 100% 98%, 0 95%)"
                  }}
                >
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-50 mix-blend-screen"></div>
                </div>

                {/* Tape/Staple Effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#e8e4d0] shadow-sm transform -rotate-2 opacity-90 z-20"></div>
              </div>

              {/* Text Content - Messy Layout */}
              <div className="text-left relative pl-4 border-l-2 border-black/20 group-hover:border-black transition-colors duration-300">
                <h3 className="text-4xl font-black font-sans uppercase leading-[0.85] text-black mb-2">
                  {member.name.split(' ').map((n, i) => (
                    <span key={i} className="inline-block bg-white px-1 skew-x-[-10deg]">{n}</span>
                  ))}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 bg-black rounded-full"></span>
                  <span className="font-mono text-xs uppercase tracking-widest text-gray-500">{member.role}</span>
                </div>

                <p className="font-serif text-lg leading-6 text-gray-800 mb-4 group-hover:text-black">
                  {member.description}
                </p>

                {/* Quirk Scribble */}
                <div className="relative mt-6 pt-4 border-t border-dashed border-black/30">
                  <svg className="absolute -top-3 right-0 w-8 h-8 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 100">
                    <path d="M10,10 L90,90 M90,10 L10,90" stroke="currentColor" strokeWidth="10" />
                  </svg>
                  <p className="font-handwritten text-sm text-gray-600 rotate-1">
                    <span className="font-bold bg-yellow-200 px-1">NOTE:</span> {member.quirk}
                  </p>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};