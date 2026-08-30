import { Link } from 'react-router-dom';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { ProgressBar } from './common/ProgressBar';
import { formatTimestamp } from '../lib/utils';
import { resolveMediaUrl } from '../lib/utils'

export function VideoCard({ video, progress, to }) {
    const completed = progress?.completed;
    const pct = progress?.completionPercentage ?? 0;

    return (
        <Link to={to}>
            <Card className="group overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-video w-full overflow-hidden bg-ink-100">
                    {video.thumbnail ? (
                        <img
                            src={resolveMediaUrl(video.thumbnail)}
                            alt={video.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-300">
                            <PlayCircle size={40} />
                        </div>
                    )}
                    {completed && (
                        <div className="absolute right-2 top-2">
                            <Badge tone="success" className="gap-1 bg-white/90 shadow-sm">
                                <CheckCircle2 size={12} />
                                Completed
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="space-y-2 p-4">
                    <h3 className="line-clamp-1 font-display text-sm font-semibold text-ink-900">
                        {video.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-ink-500">{video.description}</p>

                    <div className="flex items-center justify-between text-xs text-ink-400">
                        <span className="font-mono">{formatTimestamp(video.durationSeconds)}</span>
                        {progress !== undefined && <span>{Math.round(pct)}% complete</span>}
                    </div>

                    {progress !== undefined && <ProgressBar value={pct} />}
                </div>
            </Card>
        </Link>
    );
}