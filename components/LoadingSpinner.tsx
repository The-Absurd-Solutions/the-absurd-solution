import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text = 'Loading...',
    fullScreen = false
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    };

    const containerClasses = fullScreen
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-surface'
        : 'flex items-center justify-center p-8';

    return (
        <div className={containerClasses} role="status" aria-live="polite">
            <div className="text-center">
                <motion.svg
                    className={`${sizeClasses[size]} mx-auto mb-4`}
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                >
                    <motion.path
                        d="M50,15 C70,15 85,30 85,50 C85,70 70,85 50,85 C30,85 15,70 15,50 C15,30 30,15 50,15"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.path
                        d="M50,25 C65,25 75,35 75,50 C75,65 65,75 50,75 C35,75 25,65 25,50 C25,35 35,25 50,25"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeDasharray="5,5"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ transformOrigin: 'center' }}
                    />
                </motion.svg>

                <motion.p
                    className="text-base font-display font-medium text-white"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                >
                    {text}
                </motion.p>

                <p className="text-sm text-muted mt-2">
                    Bending reality...
                </p>
            </div>
        </div>
    );
};

export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <motion.div
            className={`bg-white/5 rounded-lg ${className}`}
            animate={{
                opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            aria-hidden="true"
        />
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="glass-card p-8" aria-hidden="true">
            <SkeletonLoader className="w-16 h-16 rounded-full mb-4" />
            <SkeletonLoader className="w-3/4 h-8 mb-4" />
            <SkeletonLoader className="w-full h-4 mb-2" />
            <SkeletonLoader className="w-5/6 h-4" />
        </div>
    );
};

export default LoadingSpinner;
