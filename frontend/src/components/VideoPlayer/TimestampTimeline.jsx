import { memo, useRef, useCallback } from 'react';
import { formatTimestamp, cn } from '../../lib/utils';

/**
 * Scrub bar with question markers. Progress fill is imperative (see
 * VideoPlayer/AdminVideoPreview) so playback never triggers a re-render here.
 *
 * `variant="learner"` colors markers by answered/unanswered.
 * `variant="admin"` ignores answered state (not meaningful for admins) and,
 * if `onMarkerClick` is given, clicking a marker opens it for editing
 * instead of just seeking — that's what makes "click the timeline to place
 * or edit a question" possible.
 */
export const TimestampTimeline = memo(function TimestampTimeline({
    duration,
    questions,
    answeredQuestionIds = new Set(),
    progressRef,
    onSeek,
    onMarkerClick,
    disabled,
    variant = 'learner',
}) {
    const trackRef = useRef(null);

    const handleClick = useCallback(
        (e) => {
            if (disabled || !duration || !trackRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            onSeek(ratio * duration);
        },
        [disabled, duration, onSeek],
    );

    return (
        <div className="w-full select-none">
            <div
                ref={trackRef}
                onClick={handleClick}
                className={cn(
                    'relative h-2 w-full cursor-pointer rounded-full bg-white/25',
                    disabled && 'cursor-not-allowed opacity-60',
                )}
            >
                <div
                    ref={progressRef}
                    className="absolute inset-y-0 left-0 rounded-full bg-brand-400"
                    style={{ width: '0%' }}
                />

                {duration > 0 &&
                    questions.map((q) => {
                        const leftPct = (q.timestamp / duration) * 100;
                        const isAnswered = variant === 'learner' && answeredQuestionIds.has(q._id);
                        return (
                            <div
                                key={q._id}
                                className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${leftPct}%` }}
                                onClick={(e) => {
                                    if (!onMarkerClick) return;
                                    e.stopPropagation(); // don't also trigger a seek on the track
                                    onMarkerClick(q);
                                }}
                            >
                                <div
                                    className={cn(
                                        'h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125',
                                        onMarkerClick && 'cursor-pointer',
                                        isAnswered ? 'bg-brand-500' : 'bg-accent-500',
                                    )}
                                    title={`${formatTimestamp(q.timestamp)} — ${q.text}`}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
});