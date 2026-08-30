import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(function Input({ className, label, error, id, ...props }, ref) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-ink-700">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={id}
                className={cn(
                    'h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900',
                    'placeholder:text-ink-400',
                    'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
                    error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
                    className,
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
});