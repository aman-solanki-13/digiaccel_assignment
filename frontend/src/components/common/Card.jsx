import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-ink-100 bg-white shadow-sm shadow-ink-900/[0.02]',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}