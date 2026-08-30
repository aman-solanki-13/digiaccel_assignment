import { useMemo } from 'react';
import { Video as VideoIcon } from 'lucide-react';
import { Layout } from '../../components/common/Layout';
import { VideoCard } from '../../components/VideoCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Spinner } from '../../components/common/Spinner';
import { useVideos } from '../../hooks/useVideos';
import { useAuth } from '../../context/AuthContext';

export function LearnerDashboard() {
    const { user } = useAuth();
    const { data: videos, isLoading } = useVideos();

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-ink-900">
                    {greeting}, {user?.name?.split(' ')[0]}
                </h1>
                <p className="mt-1 text-sm text-ink-500">Pick up where you left off.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={28} />
                </div>
            ) : !videos?.length ? (
                <EmptyState
                    icon={VideoIcon}
                    title="No videos assigned yet"
                    description="Once an admin assigns you a video, it'll show up here."
                />
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} to={`/videos/${video._id}`} progress={video.progress} />
                    ))}
                </div>
            )}
        </Layout>
    );
}