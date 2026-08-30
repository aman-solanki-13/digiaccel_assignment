import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { TimestampTimeline } from './TimestampTimeline';
import { QuestionOverlay } from './QuestionOverlay';
import { formatTimestamp } from '../../lib/utils';

/**
 * Self-contained video player with timestamp-triggered questions.
 *
 * Rendering strategy: `timeupdate` fires very frequently. We split work into
 * two tiers — an imperative tier (scrub bar width, question-trigger checks)
 * that touches the DOM/refs directly and never calls setState, and a state
 * tier that only updates roughly once a second for the visible time label,
 * plus on discrete events (play/pause, question triggered/answered).
 */
export function VideoPlayer({
    videoUrl,
    questions,
    answeredQuestionIds,
    initialTime = 0,
    onProgressTick, // (currentTime, durationRatio) -> void, called ~1x/sec
    onSubmitAnswer, // (questionId, answer) -> Promise<{isCorrect}>
    onEnded,
}) {
    const videoRef = useRef(null);
    const progressBarRef = useRef(null);
    const containerRef = useRef(null);
    const lastTickRef = useRef(0);
    const seekedInitialRef = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [displayTime, setDisplayTime] = useState(initialTime);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // sorted, unanswered-first lookup so we trigger the earliest pending question
    const sortedQuestions = useMemo(
        () => [...questions].sort((a, b) => a.timestamp - b.timestamp),
        [questions],
    );

    const handleLoadedMetadata = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        setDuration(video.duration || 0);
        if (!seekedInitialRef.current && initialTime > 0) {
            video.currentTime = initialTime;
            seekedInitialRef.current = true;
        }
    }, [initialTime]);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video || !video.duration) return;

        // imperative scrub-bar update — no re-render
        if (progressBarRef.current) {
            const pct = (video.currentTime / video.duration) * 100;
            progressBarRef.current.style.width = `${pct}%`;
        }

        // check whether we've reached a pending question
        const due = sortedQuestions.find(
            (q) => !answeredQuestionIds.has(q._id) && video.currentTime >= q.timestamp,
        );
        if (due && !activeQuestion) {
            video.pause();
            setIsPlaying(false);
            setActiveQuestion(due);
            return;
        }

        // throttled state updates: time label + progress persistence, ~1x/sec
        const now = Date.now();
        if (now - lastTickRef.current >= 1000) {
            lastTickRef.current = now;
            setDisplayTime(video.currentTime);
            onProgressTick?.(video.currentTime, video.currentTime / video.duration);
        }
    }, [sortedQuestions, answeredQuestionIds, activeQuestion, onProgressTick]);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, []);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    }, []);

    const handleSeek = useCallback((time) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = time;
        setDisplayTime(time);
    }, []);

    const handleFullscreen = useCallback(() => {
        containerRef.current?.requestFullscreen?.();
    }, []);

    const handleSubmitAnswer = useCallback(
        async (answer) => {
            if (!activeQuestion || isSubmitting) {
                return;
            }

            setIsSubmitting(true);

            try {
                const response = await onSubmitAnswer(
                    activeQuestion._id,
                    answer,
                );

                setTimeout(() => {
                    setActiveQuestion(null);

                    const video = videoRef.current;

                    if (video) {
                        video.play().catch(() => { });
                        setIsPlaying(true);
                    }
                }, 1400);

                return response;
            } finally {
                setIsSubmitting(false);
            }
        },
        [activeQuestion, isSubmitting, onSubmitAnswer],
    );



    useEffect(() => {
        const video = videoRef.current;
        if (!video) return undefined;
        const handleEnded = () => {
            setIsPlaying(false);
            onEnded?.();
        };
        video.addEventListener('ended', handleEnded);
        return () => video.removeEventListener('ended', handleEnded);
    }, [onEnded]);

    return (
        <div
            ref={containerRef}
            className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-ink-900 shadow-lg"
        >
            <video
                ref={videoRef}
                src={videoUrl}
                className="h-full w-full"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                playsInline
            />

            {activeQuestion && (
                <QuestionOverlay
                    question={activeQuestion}
                    onSubmit={handleSubmitAnswer}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* controls */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/90 via-ink-900/40 to-transparent px-4 pb-3 pt-8">
                <TimestampTimeline
                    duration={duration}
                    questions={questions}
                    answeredQuestionIds={answeredQuestionIds}
                    progressRef={progressBarRef}
                    onSeek={handleSeek}
                    disabled={Boolean(activeQuestion)}
                />

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            disabled={Boolean(activeQuestion)}
                            className="text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <button
                            onClick={toggleMute}
                            className="text-white transition-opacity hover:opacity-80"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <span className="font-mono text-xs text-white/80">
                            {formatTimestamp(displayTime)} / {formatTimestamp(duration)}
                        </span>
                    </div>
                    <button
                        onClick={handleFullscreen}
                        className="text-white transition-opacity hover:opacity-80"
                        aria-label="Fullscreen"
                    >
                        <Maximize size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}