import { cn } from '../../lib/utils';

export function ProgressBar({ value = 0, className, tone = 'brand' }) {
    const clamped = Math.min(100, Math.max(0, value));
    const fill = tone === 'brand' ? 'bg-brand-500' : 'bg-accent-500';

    return (
        <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-ink-100', className)}>
            <div
                className={cn('h-full rounded-full transition-all duration-500', fill)}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}