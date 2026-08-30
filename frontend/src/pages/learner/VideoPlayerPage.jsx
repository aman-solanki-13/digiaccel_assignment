import { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../components/common/Layout';
import { VideoPlayer } from '../../components/VideoPlayer/VideoPlayer';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { useVideo } from '../../hooks/useVideos';
import { useQuestions } from '../../hooks/useQuestions';
import { useProgress, useUpsertProgress } from '../../hooks/useProgress';
import { useResponses, useSubmitResponse } from '../../hooks/useResponses';
import { resolveMediaUrl } from '../../lib/utils';

export function VideoPlayerPage() {
    const { videoId } = useParams();
    const navigate = useNavigate();

    const { data: video, isLoading: videoLoading } = useVideo(videoId);
    const { data: questions = [], isLoading: questionsLoading } = useQuestions(videoId);
    const { data: progress, isLoading: progressLoading } = useProgress(videoId);
    const { data: responses = [] } = useResponses(videoId);

    const upsertProgress = useUpsertProgress(videoId);
    const submitResponse = useSubmitResponse(videoId);

    const answeredQuestionIds = useMemo(() => new Set(responses.map((r) => r.question)), [responses]);

    const handleProgressTick = useCallback(
        (currentTime, ratio) => {
            upsertProgress.mutate({
                lastWatchedTimestamp: currentTime,
                completionPercentage: Math.min(100, Math.round(ratio * 100)),
                completed: ratio >= 0.98,
            });
        },
        [upsertProgress],
    );

    const handleSubmitAnswer = useCallback(
        (questionId, answer) => submitResponse.mutateAsync({ questionId, answer }),
        [submitResponse],
    );

    const handleEnded = useCallback(() => {
        upsertProgress.mutate({
            lastWatchedTimestamp: video?.durationSeconds ?? 0,
            completionPercentage: 100,
            completed: true,
        });
    }, [upsertProgress, video]);

    const isLoading = videoLoading || questionsLoading || progressLoading;

    return (
        <Layout>
            <button
                onClick={() => navigate('/')}
                className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
            >
                <ArrowLeft size={16} />
                Back to my videos
            </button>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={28} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <VideoPlayer
                            videoUrl={resolveMediaUrl(video.videoUrl)}
                            questions={questions}
                            answeredQuestionIds={answeredQuestionIds}
                            initialTime={progress?.lastWatchedTimestamp ?? 0}
                            onProgressTick={handleProgressTick}
                            onSubmitAnswer={handleSubmitAnswer}
                            onEnded={handleEnded}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="mb-2 flex items-center justify-between">
                                <h1 className="font-display text-lg font-semibold text-ink-900">{video.title}</h1>
                                {progress?.completed && <Badge tone="success">Completed</Badge>}
                            </div>
                            <p className="text-sm text-ink-500">{video.description}</p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <h2 className="mb-3 font-display text-sm font-semibold text-ink-900">
                                Questions in this video ({questions.length})
                            </h2>
                            <ul className="space-y-2">
                                {questions.map((q) => {
                                    const answered = answeredQuestionIds.has(q._id);
                                    return (
                                        <li
                                            key={q._id}
                                            className="flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2 text-xs"
                                        >
                                            <span
                                                className={`h-2 w-2 shrink-0 rounded-full ${answered ? 'bg-brand-500' : 'bg-accent-500'}`}
                                            />
                                            <span className="font-mono text-ink-400">
                                                {Math.floor(q.timestamp / 60)}:{String(q.timestamp % 60).padStart(2, '0')}
                                            </span>
                                            <span className="truncate text-ink-600">{q.text}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}