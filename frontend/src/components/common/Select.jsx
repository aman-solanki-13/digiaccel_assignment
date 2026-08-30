import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Select = forwardRef(function Select(
    { className, label, error, id, children, ...props },
    ref,
) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-ink-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    id={id}
                    className={cn(
                        'h-10 w-full appearance-none rounded-lg border border-ink-200 bg-white pl-3 pr-9 text-sm text-ink-900',
                        'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
                        error && 'border-red-400',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
            </div>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
});