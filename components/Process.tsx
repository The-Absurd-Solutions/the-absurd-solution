import React from 'react';
import { motion } from 'framer-motion';
import { GlitchText } from './GlitchText';
import { Terminal, Map, Skull, Truck, Layers, ShieldCheck, Eye, Activity, Wallet, Key } from 'lucide-react';

const steps = [
  {
    id: '01',
    title: "Orientation / Framing",
    absurdTitle: "Framing the Hallucination",
    description: "We clarify what 'success' means (business + technical outcomes), constraints, and what must not break.",
    icon: Terminal
  },
  {
    id: '02',
    title: "System Map",
    absurdTitle: "Cartography of Chaos",
    description: "We produce a high-signal system map. We define boundaries, deployment topology, data flows, and the trust model.",
    icon: Map
  },
  {
    id: '03',
    title: "Risk Register",
    absurdTitle: "Prophesying Doom",
    description: "Pre-mortem: assume it failed—why? We assess security risks, reliability risks, scalability risks, and cost risks.",
    icon: Skull
  },
  {
    id: '04',
    title: "Delivery Blueprint",
    absurdTitle: "Shipping the Unshippable",
    description: "We make delivery boring. CI/CD with consistent environments, IaC with reviewable diffs, and a solid release strategy.",
    icon: Truck
  },
  {
    id: '05',
    title: "Build in Slices",
    absurdTitle: "Slicing Reality",
    description: "We build thin vertical slices: UI → API → storage. Exposes integration issues early and prevents 'late surprises'.",
    icon: Layers
  },
  {
    id: '06',
    title: "Security Baseline",
    absurdTitle: "Paranoia as a Service",
    description: "Security is a baseline. Least-privilege IAM, managed secrets, WAF/rate-limits, and strict auth flows.",
    icon: ShieldCheck
  },
  {
    id: '07',
    title: "Observability First",
    absurdTitle: "Staring into the Void",
    description: "If you can't see it, you can't run it. Structured logs, key metrics (latency, errors), and business dashboards.",
    icon: Eye
  },
  {
    id: '08',
    title: "Reliability Patterns",
    absurdTitle: "Embracing the Crash",
    description: "We design for failure. Timeouts, retries, circuit breakers, idempotency, and DLQs.",
    icon: Activity
  },
  {
    id: '09',
    title: "Cost Discipline",
    absurdTitle: "Wallet Defense",
    description: "Budgets are architecture. We set budgets, per-request cost estimates, caching strategies, and scaling limits.",
    icon: Wallet
  },
  {
    id: '10',
    title: "Handover",
    absurdTitle: "The Great Escape",
    description: "We don't just 'deliver code.' We deliver a system you can own. Docs that explain 'why', playbooks, and ownership maps.",
    icon: Key
  }
];

export const Process: React.FC = () => {
  return (
    <section id="process" className="min-h-screen py-20 px-8 bg-white relative overflow-hidden">
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
        <h2 className="text-4xl md:text-6xl mb-20 text-center text-black">
          <GlitchText text="METHOD TO THE MADNESS" />
        </h2>

        <div className="relative">
          {/* The Timeline Line - Wobbly and sketched */}
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-1 bg-black md:-ml-0.5 ink-effect opacity-20"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className={`flex flex-col md:flex-row gap-8 items-start md:items-center ${index % 2 === 0 ? 'md:flex-row-reverse text-left md:text-right' : 'md:flex-row text-left'
                  }`}
              >
                {/* Content Side */}
                <div className="flex-1 w-full md:w-auto">
                  <div className="sketch-box p-6 bg-white relative group hover:bg-black hover:text-white transition-colors duration-300">
                    <span className="absolute -top-4 font-bold text-4xl font-sans opacity-20 group-hover:opacity-100 group-hover:text-black group-hover:[text-shadow:0_3px_0_white] transition-all duration-300">
                      {step.id}
                    </span>
                    <h3 className="text-xl font-bold font-sans mb-1 uppercase tracking-wider">{step.absurdTitle}</h3>
                    <p className="text-xs font-mono uppercase mb-3 opacity-60">[{step.title}]</p>
                    <p className="text-lg leading-relaxed handwritten group-hover:text-gray-200">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="relative z-10 flex items-center justify-center w-10 h-10 md:w-16 md:h-16 shrink-0 bg-white border-2 border-black rounded-full ink-effect">
                  <step.icon size={24} className="md:w-8 md:h-8" />
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