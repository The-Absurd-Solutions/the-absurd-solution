import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail } from 'lucide-react';

export const Contact: React.FC = () => {
    return (
        <section
            id="contact"
            aria-labelledby="contact-heading"
            className="min-h-screen py-16 md:py-20 px-4 md:px-8 flex flex-col items-center justify-center relative bg-white"
        >
            <div className="max-w-3xl mx-auto text-center">
                <h2
                    id="contact-heading"
                    className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 text-black ink-effect"
                >
                    TELEPORT <br /> INTO OUR WORLD
                </h2>

                <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-lg mx-auto">
                    Got a project that needs some structured chaos? Send a signal.
                </p>

                {/* Email CTA */}
                <motion.a
                    href="mailto:the@absurdsolution.com"
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-4 sketch-box text-xl md:text-2xl font-bold uppercase tracking-wider cursor-pointer"
                    aria-label="Send email to the@absurdsolution.com"
                >
                    <Mail size={24} aria-hidden="true" />
                    the@absurdsolution.com
                </motion.a>

                {/* Location */}
                <div className="mt-16 md:mt-20">
                    <div className="inline-block sketch-box p-8 md:p-12 group hover:bg-black transition-colors duration-300">
                        <MapPin size={36} className="mx-auto mb-4 text-black group-hover:text-white transition-colors duration-300" aria-hidden="true" />
                        <h3 className="font-bold text-xl md:text-2xl mb-2 group-hover:text-white transition-colors duration-300">
                            LOCATION: NOVI SAD
                        </h3>
                        <address className="text-lg md:text-xl text-gray-600 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 not-italic">
                            Somewhere between 0 and 1.<br />
                            The Floating Bridge, Floor 404.<br />
                            Novi Sad, Serbia.
                        </address>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
