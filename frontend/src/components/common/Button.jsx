import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
    secondary:
        'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 focus-visible:outline-ink-400',
    accent: 'bg-accent-500 text-ink-900 hover:bg-accent-600 focus-visible:outline-accent-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
    ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 focus-visible:outline-ink-400',
};

const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef(function Button(
    { className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {children}
        </button>
    );
});