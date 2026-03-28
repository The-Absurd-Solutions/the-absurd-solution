import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps extends FallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
    const handleReload = (): void => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-8" role="alert">
            <div className="max-w-md w-full text-center">
                <div className="glass-card p-8">
                    <AlertTriangle
                        size={64}
                        className="mx-auto mb-6 text-accent animate-pulse"
                        aria-hidden="true"
                    />

                    <h1 className="text-3xl font-display font-bold mb-4 text-white">
                        REALITY GLITCHED
                    </h1>

                    <p className="text-base text-muted mb-6">
                        Something went wrong in this dimension.
                        The universe is recalibrating...
                    </p>

                    <details className="text-left mb-6 p-4 bg-white/5 rounded-lg text-sm font-mono">
                        <summary className="cursor-pointer font-medium text-white mb-2">
                            Debug Info
                        </summary>
                        <pre className="overflow-auto text-red-400 whitespace-pre-wrap">
                            {error.message}
                        </pre>
                    </details>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={resetErrorBoundary}
                            className="px-6 py-3 border border-accent/30 text-accent font-display font-medium uppercase tracking-wider flex items-center gap-2 rounded-full hover:bg-accent hover:text-black transition-all"
                            aria-label="Try again"
                        >
                            <RefreshCw size={18} aria-hidden="true" />
                            Try Again
                        </button>

                        <button
                            onClick={handleReload}
                            className="px-6 py-3 border border-white/10 text-white font-display font-medium uppercase tracking-wider rounded-full hover:bg-white/10 transition-all"
                            aria-label="Reload page"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
    const handleError = (error: Error, info: React.ErrorInfo) => {
        console.error('ErrorBoundary caught an error:', error, info);
    };

    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={handleError}
            onReset={() => {
                // Reset application state here if needed
            }}
        >
            {children}
        </ReactErrorBoundary>
    );
};

export default ErrorBoundary;
