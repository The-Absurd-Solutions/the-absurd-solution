import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
    name: string;
    email: string;
    message: string;
}

export const Contact: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            // Formspree integration - replace YOUR_FORM_ID with actual ID
            const formspreeEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/YOUR_FORM_ID';

            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    _subject: `New message from ${formData.name} via Absurd Solution`
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    };

    const resetForm = () => {
        setStatus('idle');
        setErrorMessage('');
    };

    return (
        <section
            id="contact"
            aria-labelledby="contact-heading"
            className="min-h-screen py-16 md:py-20 px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 relative bg-white"
        >
            <div className="w-full max-w-md">
                <h2
                    id="contact-heading"
                    className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 text-black ink-effect"
                >
                    TELEPORT <br /> INTO OUR WORLD
                </h2>

                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="sketch-box p-8 text-center"
                        role="alert"
                        aria-live="polite"
                    >
                        <CheckCircle size={64} className="mx-auto mb-4 text-green-600" aria-hidden="true" />
                        <h3 className="text-2xl font-bold mb-2">Message Transmitted!</h3>
                        <p className="text-lg text-gray-600 mb-6">
                            Your signal has reached our dimension. We'll respond from the ether soon.
                        </p>
                        <button
                            onClick={resetForm}
                            className="px-6 py-3 sketch-box font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                        >
                            Send Another
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                        <div className="relative">
                            <label
                                htmlFor="name"
                                className="block text-sm font-bold mb-1 text-black uppercase tracking-wider"
                            >
                                Identifier (Name)
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                autoComplete="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={status === 'loading'}
                                aria-required="true"
                                className="w-full bg-transparent border-b-2 border-black p-2 outline-none font-sans text-xl placeholder-gray-400 focus:border-dotted focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                placeholder="Enter your code..."
                            />
                        </div>

                        <div className="relative">
                            <label
                                htmlFor="email"
                                className="block text-sm font-bold mb-1 text-black uppercase tracking-wider"
                            >
                                Frequency (Email)
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={status === 'loading'}
                                aria-required="true"
                                className="w-full bg-transparent border-b-2 border-black p-2 outline-none font-sans text-xl placeholder-gray-400 focus:border-dotted focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                placeholder="user@universe.com"
                            />
                        </div>

                        <div className="relative">
                            <label
                                htmlFor="message"
                                className="block text-sm font-bold mb-1 text-black uppercase tracking-wider"
                            >
                                Message to the Ether
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                required
                                value={formData.message}
                                onChange={handleChange}
                                disabled={status === 'loading'}
                                aria-required="true"
                                className="w-full bg-transparent border-2 border-black p-4 outline-none text-xl resize-none rounded-lg focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                placeholder="Write to us..."
                            />
                        </div>

                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-300 rounded-lg"
                                role="alert"
                                aria-live="assertive"
                            >
                                <AlertCircle size={20} className="text-red-600 shrink-0" aria-hidden="true" />
                                <p className="text-red-700 font-sans">
                                    {errorMessage || 'Failed to send message. Please try again.'}
                                </p>
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={status === 'loading'}
                            whileHover={status !== 'loading' ? { scale: 1.02 } : {}}
                            whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
                            className="w-full py-4 bg-white border-2 border-black text-black font-bold tracking-widest uppercase flex items-center justify-center gap-2 group sketch-box hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black transition-all"
                            aria-describedby={status === 'error' ? 'form-error' : undefined}
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                    <span>Transmitting...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={18} className="text-black group-hover:text-white group-hover:translate-x-1 transition-all" aria-hidden="true" />
                                    <span>Cast Message</span>
                                </>
                            )}
                        </motion.button>
                    </form>
                )}
            </div>

            <div
                className="w-full max-w-md relative h-80 border-2 border-black bg-white flex items-center justify-center sketch-box group hover:bg-black transition-colors duration-300"
                aria-label="Contact information and location"
            >
                <div className="text-center z-10 ink-effect">
                    <MapPin size={48} className="mx-auto mb-4 text-black group-hover:text-white transition-colors duration-300" aria-hidden="true" />
                    <h3 className="font-bold text-2xl mb-2 group-hover:text-white transition-colors duration-300">
                        LOCATION: NOVI SAD
                    </h3>
                    <address className="text-xl text-gray-600 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 not-italic">
                        Somewhere between 0 and 1.<br />
                        The Floating Bridge, Floor 404.<br />
                        Novi Sad, Serbia.
                    </address>
                    <div className="mt-6 pt-4 border-t border-black/20 group-hover:border-white/20 transition-colors duration-300">
                        <a
                            href="mailto:the@absurdsolution.com"
                            className="inline-flex items-center gap-2 text-black group-hover:text-white hover:underline text-lg font-bold transition-colors duration-300"
                            aria-label="Send email to the@absurdsolution.com"
                        >
                            <Mail size={20} aria-hidden="true" />
                            the@absurdsolution.com
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;