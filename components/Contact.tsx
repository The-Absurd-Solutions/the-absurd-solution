import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail } from 'lucide-react';

export const Contact: React.FC = () => {
    return (
        <section
            id="contact"
            aria-labelledby="contact-heading"
            className="min-h-screen py-16 md:py-20 px-4 md:px-8 flex flex-col items-center justify-center relative"
        >
            <div className="max-w-3xl mx-auto text-center">
                <h2
                    id="contact-heading"
                    className="text-3xl md:text-5xl font-display font-bold mb-6 md:mb-8 text-white"
                >
                    TELEPORT <br /> INTO OUR WORLD
                </h2>

                <p className="text-xl md:text-2xl text-muted mb-12 max-w-lg mx-auto font-light">
                    Got a project that needs some structured chaos? Send a signal.
                </p>

                {/* Email CTA */}
                <motion.a
                    href="mailto:the@absurdsolution.com"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 px-8 py-4 border border-accent/30 text-accent text-lg md:text-xl font-display font-medium uppercase tracking-wider cursor-pointer rounded-full hover:bg-accent hover:text-black transition-all duration-300"
                    aria-label="Send email to the@absurdsolution.com"
                >
                    <Mail size={22} aria-hidden="true" />
                    the@absurdsolution.com
                </motion.a>

                {/* Location */}
                <div className="mt-16 md:mt-20">
                    <div className="inline-block glass-card p-8 md:p-12 group">
                        <MapPin size={32} className="mx-auto mb-4 text-accent" aria-hidden="true" />
                        <h3 className="font-display font-semibold text-xl md:text-2xl mb-2 text-white">
                            LOCATION: NOVI SAD
                        </h3>
                        <address className="text-base md:text-lg text-muted leading-relaxed not-italic">
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
