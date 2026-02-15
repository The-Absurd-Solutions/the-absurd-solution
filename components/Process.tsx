import React from 'react';
import { motion } from 'framer-motion';
import { GlitchText } from './GlitchText';
import { MessageCircle, Search, Map, Layers, RefreshCw, Rocket } from 'lucide-react';

const steps = [
  {
    id: '01',
    title: "Discovery Call",
    absurdTitle: "Reading Your Mind",
    description: "We sit down, listen, and ask the hard questions. What's the real problem? Who are the users? What does success look like? No code yet, just honest conversation.",
    icon: MessageCircle
  },
  {
    id: '02',
    title: "Research & Brainstorm",
    absurdTitle: "Controlled Chaos",
    description: "We dig deep. Market research, technical options, competitor analysis. We brainstorm multiple approaches, debate trade-offs, and narrow down to the best solution for your budget and timeline.",
    icon: Search
  },
  {
    id: '03',
    title: "Strategy & Roadmap",
    absurdTitle: "Cartography of Chaos",
    description: "We break the project into clear milestones and sprints. You get a roadmap with priorities, timelines, and deliverables. No vague promises, just a concrete plan we both agree on.",
    icon: Map
  },
  {
    id: '04',
    title: "Build in Sprints",
    absurdTitle: "Slicing Reality",
    description: "We work in short agile cycles. Every 1-2 weeks you see real progress, give feedback, and we adjust. No disappearing for months. You're in the loop the entire time.",
    icon: Layers
  },
  {
    id: '05',
    title: "Review & Iterate",
    absurdTitle: "Embracing the Plot Twist",
    description: "After each sprint we review together. Things changed? New idea? No problem. We adapt the plan, reprioritize, and keep moving. Flexibility is built into how we work.",
    icon: RefreshCw
  },
  {
    id: '06',
    title: "Launch & Handover",
    absurdTitle: "The Great Escape",
    description: "We deploy, test in production, and make sure everything works. Then we hand over: documentation, access, knowledge transfer. Your project, your ownership. We stay available if you need us.",
    icon: Rocket
  }
];

export const Process: React.FC = () => {
  return (
    <section id="process" className="min-h-screen py-16 md:py-20 px-4 md:px-8 bg-white relative overflow-hidden">
      {/* Background Chaos */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-2xl sm:text-4xl md:text-6xl mb-12 md:mb-20 text-center text-black">
          <GlitchText text="METHOD TO THE MADNESS" />
        </h2>

        <div className="relative">
          {/* The Timeline Line - Wobbly and sketched */}
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-1 bg-black md:-ml-0.5 ink-effect opacity-20"></div>

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className={`flex items-start md:items-center gap-4 md:gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse text-left md:text-right' : 'md:flex-row text-left'
                  }`}
              >
                {/* Content Side */}
                <div className="flex-1 w-full md:w-auto">
                  <div className="sketch-box p-4 md:p-6 bg-white relative group hover:bg-black hover:text-white transition-colors duration-300">
                    <span className="absolute -top-4 font-bold text-2xl md:text-4xl font-sans opacity-20 group-hover:opacity-100 group-hover:text-black group-hover:[text-shadow:0_3px_0_white] transition-all duration-300">
                      {step.id}
                    </span>
                    <h3 className="text-base md:text-xl font-bold font-sans mb-1 uppercase tracking-wider">{step.absurdTitle}</h3>
                    <p className="text-xs font-mono uppercase mb-2 md:mb-3 opacity-60">[{step.title}]</p>
                    <p className="text-sm md:text-lg leading-relaxed handwritten group-hover:text-gray-200 transition-colors duration-300 ease-in-out">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="relative z-10 flex items-center justify-center w-10 h-10 md:w-16 md:h-16 shrink-0 bg-white border-2 border-black rounded-full ink-effect">
                  <step.icon size={20} className="md:w-8 md:h-8" />
                </div>

                {/* Spacer for the other side */}
                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Connector */}
        <div className="text-center mt-16">
          <p className="font-mono text-sm">END OF ALGORITHM.</p>
        </div>
      </div>
    </section>
  );
};