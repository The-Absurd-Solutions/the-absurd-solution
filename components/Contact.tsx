import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Mail } from 'lucide-react';

export const Contact: React.FC = () => {
    const [status, setStatus] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Message cast into the ether... awaiting response from the other dimension.');
    }

  return (
    <section id="contact" className="min-h-screen py-20 px-8 flex flex-col md:flex-row items-center justify-center gap-16 relative bg-white">
      
      <div className="w-full max-w-md">
        <h2 className="text-5xl font-bold mb-8 text-black ink-effect">
            TELEPORT <br/> INTO OUR WORLD
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative">
                <label className="block text-sm font-bold mb-1 text-black uppercase tracking-wider">Identifier (Name)</label>
                <input 
                    type="text" 
                    required
                    className="w-full bg-transparent border-b-2 border-black p-2 outline-none font-sans text-xl placeholder-gray-400 focus:border-dotted"
                    placeholder="Enter your code..."
                />
            </div>

             <div className="relative">
                <label className="block text-sm font-bold mb-1 text-black uppercase tracking-wider">Frequency (Email)</label>
                <input 
                    type="email" 
                    required
                    className="w-full bg-transparent border-b-2 border-black p-2 outline-none font-sans text-xl placeholder-gray-400 focus:border-dotted"
                    placeholder="user@universe.com"
                />
            </div>

             <div className="relative">
                <label className="block text-sm font-bold mb-1 text-black uppercase tracking-wider">Message to the Ether</label>
                <textarea 
                    rows={4}
                    required
                    className="w-full bg-transparent border-2 border-black p-4 outline-none text-xl resize-none rounded-lg"
                    placeholder="Write to us..."
                />
            </div>

            <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-black text-white font-bold tracking-widest uppercase flex items-center justify-center gap-2 group sketch-box hover:text-white"
            >
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                Cast Message
            </motion.button>
            {status && <p className="text-lg text-center text-black mt-4 handwritten animate-pulse">{status}</p>}
        </form>
      </div>

      <div className="w-full max-w-md relative h-80 border-2 border-black bg-white flex items-center justify-center sketch-box group hover:bg-black transition-colors duration-300">
         <div className="text-center z-10 ink-effect">
            <MapPin size={48} className="mx-auto mb-4 text-black group-hover:text-white transition-colors duration-300" />
            <h3 className="font-bold text-2xl mb-2 group-hover:text-white transition-colors duration-300">LOCATION: NOVI SAD</h3>
            <p className="text-xl text-gray-600 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Somewhere between 0 and 1.<br/>
                The Floating Bridge, Floor 404.<br/>
                Novi Sad, Serbia.
            </p>
            <div className="mt-6 pt-4 border-t border-black/20 group-hover:border-white/20 transition-colors duration-300">
              <a href="mailto:the@absurdsolution.com" className="inline-flex items-center gap-2 text-black group-hover:text-white hover:underline text-lg font-bold transition-colors duration-300">
                <Mail size={20} className="group-hover:text-white transition-colors duration-300" />
                the@absurdsolution.com
              </a>
            </div>
         </div>
      </div>
    </section>
  );
};