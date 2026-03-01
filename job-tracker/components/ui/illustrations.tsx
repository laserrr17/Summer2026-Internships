import React from 'react';

export function EmptyStateIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 400 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect x="100" y="60" width="200" height="180" rx="12" className="fill-card stroke-border" strokeWidth="2" />
            <path d="M100 110H300" className="stroke-border" strokeWidth="2" />
            <circle cx="130" cy="85" r="6" className="fill-muted-foreground/20" />
            <circle cx="150" cy="85" r="6" className="fill-muted-foreground/20" />
            <rect x="130" y="140" width="140" height="12" rx="6" className="fill-muted-foreground/10" />
            <rect x="130" y="170" width="100" height="12" rx="6" className="fill-muted-foreground/10" />
            <rect x="130" y="200" width="120" height="12" rx="6" className="fill-muted-foreground/10" />

            {/* Floating elements */}
            <circle cx="80" cy="220" r="20" className="fill-primary/10 animate-pulse" />
            <circle cx="320" cy="100" r="15" className="fill-blue-500/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </svg>
    );
}

export function NoResultsIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 400 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="200" cy="150" r="60" className="fill-card stroke-border" strokeWidth="2" />
            <path d="M245 195L275 225" className="stroke-border" strokeWidth="8" strokeLinecap="round" />
            <circle cx="200" cy="150" r="25" className="fill-muted-foreground/5" />
            <path d="M185 135L215 165M215 135L185 165" className="stroke-muted-foreground/20" strokeWidth="4" strokeLinecap="round" />

            {/* Decorative dots */}
            <circle cx="100" cy="100" r="4" className="fill-muted-foreground/20" />
            <circle cx="300" cy="200" r="4" className="fill-muted-foreground/20" />
            <circle cx="280" cy="80" r="2" className="fill-muted-foreground/20" />
        </svg>
    );
}
