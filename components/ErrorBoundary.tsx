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
        <div className="min-h-screen flex items-center justify-center bg-white p-8" role="alert">
            <div className="max-w-md w-full text-center">
                <div className="sketch-box p-8 bg-white">
                    <AlertTriangle
                        size={64}
                        className="mx-auto mb-6 text-black animate-pulse"
                        aria-hidden="true"
                    />

                    <h1 className="text-3xl font-bold mb-4 text-black ink-effect">
                        REALITY GLITCHED
                    </h1>

                    <p className="text-lg text-gray-600 mb-6 font-sans">
                        Something went wrong in this dimension.
                        The universe is recalibrating...
                    </p>

                    <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg text-sm font-mono">
                        <summary className="cursor-pointer font-bold text-black mb-2">
                            Debug Info
                        </summary>
                        <pre className="overflow-auto text-red-600 whitespace-pre-wrap">
                            {error.message}
                        </pre>
                    </details>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={resetErrorBoundary}
                            className="px-6 py-3 sketch-box font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-black hover:text-white transition-colors duration-300 ease-in-out"
                            aria-label="Try again"
                        >
                            <RefreshCw size={18} aria-hidden="true" />
                            Try Again
                        </button>

                        <button
                            onClick={handleReload}
                            className="px-6 py-3 border-2 border-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-300 ease-in-out"
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
