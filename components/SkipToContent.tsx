import React from 'react';

interface SkipToContentProps {
    targetId?: string;
    label?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({
    targetId = 'main-content',
    label = 'Skip to main content'
}) => {
    return (
        <a
            href={`#${targetId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:px-6 focus:py-3 focus:bg-accent focus:text-black focus:font-bold focus:tracking-wider focus:uppercase focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:rounded-lg"
        >
            {label}
        </a>
    );
};

export default SkipToContent;
