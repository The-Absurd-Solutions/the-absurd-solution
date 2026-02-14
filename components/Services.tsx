import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Package, Code2, Zap, ArrowRight } from 'lucide-react';
import { GlitchText } from './GlitchText';

const services = [
  {
    id: '01',
    category: "UI/UX Design",
    absurdTitle: "Pixel Witchcraft",
    description: "We design interfaces that people actually enjoy using. Research-driven, user-tested, pixel-perfect.",
    offerings: [
      "User Research & Personas",
      "Wireframing & Prototyping",
      "Visual Design Systems",
      "Usability Testing",
      "Responsive & Adaptive Design",
      "Design Handoff & Dev Collaboration"
    ],
    icon: Palette
  },
  {
    id: '02',
    category: "Product Development",
    absurdTitle: "Idea Alchemy",
    description: "From napkin sketch to market-ready product. We validate, build, and iterate until it sticks.",
    offerings: [
      "Product Strategy & Roadmapping",
      "MVP Definition & Rapid Prototyping",
      "Market Validation & User Testing",
      "Feature Prioritization",
      "Analytics & Growth Metrics",
      "Stakeholder Alignment"
    ],
    icon: Package
  },
  {
    id: '03',
    category: "Software Development",
    absurdTitle: "Code Sorcery",
    description: "Full-stack engineering with modern tools. We build systems that scale, perform, and don't break at 3 AM.",
    offerings: [
      "Frontend & Backend Engineering",
      "Cloud Architecture (AWS, GCP)",
      "API Design & Integration",
      "Database Design & Optimization",
      "CI/CD & DevOps Pipelines",
      "Security & Performance Audits"
    ],
    icon: Code2
  },
  {
    id: '04',
    category: "Automation",
    absurdTitle: "Laziness Engineering",
    description: "If a human does it more than twice, we automate it. Workflows, pipelines, and processes on autopilot.",
    offerings: [
      "Business Process Automation",
      "ETL & Data Pipelines",
      "Infrastructure as Code",
      "Automated Testing & QA",
      "Monitoring & Alerting Systems",
      "AI-Powered Workflows"
    ],
    icon: Zap
  }
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="min-h-screen py-16 md:py-32 px-4 relative overflow-hidden bg-white">
      {/* Background Static/Grain */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full">
          <filter id="services_noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#services_noise)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-4">
        {/* Header - matching Portfolio style */}
        <div className="mb-12 md:mb-32 text-center md:text-left border-b-4 border-black pb-8">
          <h2 className="text-3xl sm:text-5xl md:text-9xl text-black tracking-tighter uppercase leading-none">
            <GlitchText text="SOLVING THE IMPOSSIBLE" />
          </h2>
          <div className="flex justify-between items-end mt-4">
            <p className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase opacity-60 hidden md:block">
              // WHAT WE DO // CORE DISCIPLINES
            </p>
            <div className="bg-black text-white px-2 py-1 font-bold font-mono text-xs uppercase">
              Disciplines: {services.length}
            </div>
          </div>
        </div>

        {/* Services Grid - stacked cards */}
        <div className="flex flex-col gap-16 md:gap-32">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col md:flex-row gap-8 md:gap-24 items-start group ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Left: Icon + Number Area */}
              <div className="w-full md:w-5/12 relative">
                {/* Black Backdrop for depth */}
                <div
                  className="absolute inset-0 bg-black/90 transition-transform duration-500 group-hover:translate-x-3 group-hover:translate-y-3"
                  style={{
                    clipPath: index % 2 === 0
                      ? "polygon(2% 2%, 98% 0, 100% 98%, 0 95%)"
                      : "polygon(0 0, 100% 5%, 95% 100%, 5% 95%)"
                  }}
                ></div>

                <div
                  className="relative bg-white border-4 border-black p-8 md:p-16 flex flex-col items-center justify-center text-center transition-colors duration-500 group-hover:bg-black group-hover:text-white"
                  style={{
                    clipPath: index % 2 === 0
                      ? "polygon(2% 2%, 98% 0, 100% 98%, 0 95%)"
                      : "polygon(0 0, 100% 5%, 95% 100%, 5% 95%)"
                  }}
                >
                  {/* Big Number */}
                  <span className="text-[5rem] md:text-[10rem] font-black leading-none opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
                    {service.id}
                  </span>

                  <div className="relative z-10">
                    <service.icon size={48} strokeWidth={1.2} className="mx-auto mb-4 md:mb-6 md:w-16 md:h-16" />
                    <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-60 mb-2">
                      [{service.absurdTitle}]
                    </p>
                    <h3 className="text-3xl md:text-4xl font-black font-sans uppercase tracking-tight">
                      {service.category}
                    </h3>
                  </div>
                </div>

                {/* Stamped ID */}
                <div className="absolute -top-6 -left-6 z-20 hidden md:block">
                  <div className="border-2 border-black bg-white px-3 py-1 font-mono text-sm font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-3">
                    DEPT #{service.id}
                  </div>
                </div>
              </div>

              {/* Right: Description + Offerings */}
              <div className="w-full md:w-7/12 relative">
                <motion.h3
                  className="text-2xl sm:text-4xl md:text-6xl font-black font-sans uppercase leading-[0.9] mb-4 md:mb-6 text-black"
                >
                  {service.category}
                </motion.h3>

                <p className="text-base md:text-xl font-serif text-gray-900 leading-relaxed mb-6 md:mb-8 border-l-2 border-black pl-4">
                  {service.description}
                </p>

                <div>
                  <h4 className="font-bold uppercase mb-4 text-sm tracking-widest border-b-2 border-black pb-2 inline-block">
                    What We Deliver
                  </h4>
                  <ul className="list-none space-y-3 font-mono text-sm text-black">
                    {service.offerings.map((offering, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="text-black font-bold text-lg leading-none"><ArrowRight size={14} className="mt-0.5" /></span>
                        {offering}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
