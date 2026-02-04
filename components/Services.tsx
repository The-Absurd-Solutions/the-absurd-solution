import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, BrainCircuit, MonitorSmartphone, Zap } from 'lucide-react';
import { GlitchText } from './GlitchText';
import { Service } from '../types';

const services: Service[] = [
  {
    id: 'cloud',
    title: "Leaking Cloud",
    description: "Infrastructure that 'leaks' data... directly into secure databases. Raining zeros and ones.",
    icon: CloudRain
  },
  {
    id: 'ai',
    title: "Neurotic AI",
    description: "Networks that overthink. Connecting the unconnected.",
    icon: BrainCircuit
  },
  {
    id: 'web',
    title: "Upside Down Web",
    description: "Frontend defying gravity. Backend holding the universe together.",
    icon: MonitorSmartphone
  },
  {
    id: 'auto',
    title: "Glitch Automation",
    description: "Processes executing themselves, sometimes before you ask.",
    icon: Zap
  }
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="min-h-screen py-20 px-8 relative overflow-hidden bg-white">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="max-w-5xl mx-auto z-10 relative">
         <h2 className="text-4xl md:text-6xl mb-16 text-right text-black">
          <GlitchText text="SOLVING THE IMPOSSIBLE" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="group p-8 sketch-box relative bg-white transition-colors duration-300"
            >
              <div className="absolute -top-8 -left-4 ink-effect">
                <motion.div
                  whileHover={{ 
                    rotate: [0, 10, -10, 0],
                    scale: 1.1,
                  }}
                  className="bg-white border-2 border-black p-4 rounded-full"
                >
                  <service.icon size={48} strokeWidth={1.5} color="black" />
                </motion.div>
              </div>

              <h3 className="text-3xl font-bold mt-8 mb-4 font-sans text-black group-hover:text-white transition-colors duration-300">{service.title}</h3>
              <p className="text-lg text-gray-800 leading-snug group-hover:text-white transition-colors duration-300">{service.description}</p>
              
              {/* Decorative Scribble */}
              <svg className="absolute bottom-4 right-4 w-12 h-12 pointer-events-none">
                  <path d="M0,10 Q10,0 20,10 T40,10" fill="none" strokeWidth="1" className="stroke-black group-hover:stroke-white transition-colors duration-300" />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};