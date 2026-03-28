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
    <section id="services" className="min-h-screen py-16 md:py-32 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 px-4">
        {/* Header */}
        <div className="mb-12 md:mb-32 text-center md:text-left border-b border-white/10 pb-8">
          <h2 className="text-3xl sm:text-5xl md:text-8xl text-white tracking-tight font-display font-bold uppercase leading-none">
            <GlitchText text="SOLVING THE IMPOSSIBLE" />
          </h2>
          <div className="flex justify-between items-end mt-4">
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-muted hidden md:block">
              // WHAT WE DO // CORE DISCIPLINES
            </p>
            <div className="bg-accent/10 text-accent px-3 py-1 font-medium text-xs uppercase rounded-full border border-accent/20">
              Disciplines: {services.length}
            </div>
          </div>
        </div>

        {/* Services Grid */}
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
                <div className="relative glass-card p-8 md:p-16 flex flex-col items-center justify-center text-center group-hover:border-accent/20 transition-all duration-500">
                  {/* Big Number */}
                  <span className="text-[5rem] md:text-[10rem] font-display font-bold leading-none opacity-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none text-white">
                    {service.id}
                  </span>

                  <div className="relative z-10">
                    <service.icon size={48} strokeWidth={1} className="mx-auto mb-4 md:mb-6 md:w-16 md:h-16 text-accent" />
                    <p className="text-xs uppercase tracking-[0.3em] text-accent/60 mb-2">
                      [{service.absurdTitle}]
                    </p>
                    <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-white">
                      {service.category}
                    </h3>
                  </div>
                </div>

                {/* Label */}
                <div className="absolute -top-3 -left-3 z-20 hidden md:block">
                  <div className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 text-xs font-medium rounded-full">
                    DEPT #{service.id}
                  </div>
                </div>
              </div>

              {/* Right: Description + Offerings */}
              <div className="w-full md:w-7/12 relative">
                <h3 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold uppercase leading-[0.9] mb-4 md:mb-6 text-white">
                  {service.category}
                </h3>

                <p className="text-base md:text-lg text-white/60 leading-relaxed mb-6 md:mb-8 border-l-2 border-accent/30 pl-4">
                  {service.description}
                </p>

                <div>
                  <h4 className="font-display font-medium uppercase mb-4 text-xs tracking-widest text-accent border-b border-white/10 pb-2 inline-block">
                    What We Deliver
                  </h4>
                  <ul className="list-none space-y-3 text-sm text-white/50">
                    {service.offerings.map((offering, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <ArrowRight size={14} className="mt-0.5 text-accent/50 shrink-0" />
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
