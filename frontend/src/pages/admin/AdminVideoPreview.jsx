import { useRef, useState, useCallback } from 'react';
import { Play, Pause, Plus } from 'lucide-react';
import { TimestampTimeline } from "../../components/VideoPlayer/TimestampTimeline";

import { Button } from "../../components/common/Button";

import { formatTimestamp } from '../../lib/utils';

/**
 * Lightweight preview player for the admin question builder. It never
 * auto-pauses for questions (that's learner-only behavior) — it exists so
 * an admin can scrub to the exact moment a question should appear and place
 * it there directly, rather than guessing a timestamp in seconds.
 */
export function AdminVideoPreview({ videoUrl, questions, onAddQuestionAt, onMarkerClick }) {
    const videoRef = useRef(null);
    const progressBarRef = useRef(null);
    const lastTickRef = useRef(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [displayTime, setDisplayTime] = useState(0);

    const handleLoadedMetadata = useCallback(() => {
        setDuration(videoRef.current?.duration || 0);
    }, []);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video || !video.duration) return;

        if (progressBarRef.current) {
            progressBarRef.current.style.width = `${(video.currentTime / video.duration) * 100}%`;
        }

        // finer-grained than the learner player's 1s tick — admins are actively
        // scrubbing to find a precise moment, so the readout should feel live
        const now = Date.now();
        if (now - lastTickRef.current >= 150) {
            lastTickRef.current = now;
            setDisplayTime(video.currentTime);
        }
    }, []);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }, []);

    const handleSeek = useCallback((time) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = time;
        setDisplayTime(time);
    }, []);

    const handleAddHere = () => {
        videoRef.current?.pause();
        onAddQuestionAt(Math.round(displayTime));
    };

    return (
        <div className="overflow-hidden rounded-2xl bg-ink-900 shadow-lg">
            <video
                ref={videoRef}
                src={videoUrl}
                className="aspect-video w-full"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <div className="space-y-3 px-4 pb-4 pt-3">
                <TimestampTimeline
                    duration={duration}
                    questions={questions}
                    progressRef={progressBarRef}
                    onSeek={handleSeek}
                    onMarkerClick={onMarkerClick}
                    variant="admin"
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            className="text-white hover:opacity-80"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <span className="font-mono text-xs text-white/80">
                            {formatTimestamp(displayTime)} / {formatTimestamp(duration)}
                        </span>
                    </div>
                    <Button size="sm" variant="accent" onClick={handleAddHere}>
                        <Plus size={14} />
                        Add question here
                    </Button>
                </div>
            </div>
        </div>
    );
}