import { cn } from '../../lib/utils';

export function EmptyState({ icon: Icon, title, description, action, className }) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-14 text-center',
                className,
            )}
        >
            {Icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink-400 shadow-sm">
                    <Icon size={22} />
                </div>
            )}
            <div className="space-y-1">
                <p className="font-display text-base font-semibold text-ink-900">{title}</p>
                {description && <p className="text-sm text-ink-500">{description}</p>}
            </div>
            {action}
        </div>
    );
}