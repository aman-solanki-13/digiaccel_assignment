import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MoreVertical, Pencil, Trash2, Users, ListChecks, Video as VideoIcon } from 'lucide-react';
import { Layout } from '../../components/common/Layout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { VideoFormModal } from "./VideoFormModal";
import { resolveMediaUrl } from "../../lib/utils";
import { AssignLearnersModal } from "./AssignLearnersModal";


import {
    useVideos,
    useCreateVideo,
    useUpdateVideo,
    useTogglePublish,
    useDeleteVideo,
} from '../../hooks/useVideos';
import { useCreateAssignments } from '../../hooks/useAssignments';
import { formatTimestamp } from '../../lib/utils';

export function VideoManager() {
    const { data: videos, isLoading } = useVideos();
    const createVideo = useCreateVideo();
    const updateVideo = useUpdateVideo();
    const togglePublish = useTogglePublish();
    const deleteVideo = useDeleteVideo();
    const createAssignments = useCreateAssignments();

    const [formState, setFormState] = useState({ isOpen: false, video: null });
    const [assignState, setAssignState] = useState({ isOpen: false, video: null });
    const [openMenuId, setOpenMenuId] = useState(null);

    const handleCreateOrUpdate = async (data) => {
        if (formState.video) {
            await updateVideo.mutateAsync({ id: formState.video._id, payload: data });
        } else {
            await createVideo.mutateAsync(data);
        }
    };

    const handleDelete = async (video) => {
        if (!window.confirm(`Delete "${video.title}"? This removes its questions and progress too.`)) return;
        await deleteVideo.mutateAsync(video._id);
    };

    return (
        <Layout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-ink-900">Videos</h1>
                    <p className="mt-1 text-sm text-ink-500">Create, publish, and manage learning content.</p>
                </div>
                <Button onClick={() => setFormState({ isOpen: true, video: null })}>
                    <Plus size={16} />
                    New video
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={28} />
                </div>
            ) : !videos?.length ? (
                <EmptyState
                    icon={VideoIcon}
                    title="No videos yet"
                    description="Create your first video to start building lessons."
                    action={
                        <Button onClick={() => setFormState({ isOpen: true, video: null })}>
                            <Plus size={16} />
                            New video
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                        <Card key={video._id} className="overflow-hidden">
                            <div className="relative aspect-video w-full bg-ink-100">
                                {video.thumbnail ? (
                                    <img src={resolveMediaUrl(video.thumbnail)} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-ink-300">
                                        <VideoIcon size={32} />
                                    </div>
                                )}
                                <div className="absolute left-2 top-2">
                                    <Badge tone={video.published ? 'success' : 'neutral'}>
                                        {video.published ? 'Published' : 'Draft'}
                                    </Badge>
                                </div>
                                <div className="absolute right-2 top-2">
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === video._id ? null : video._id)}
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink-600 shadow-sm hover:bg-white"
                                        >
                                            <MoreVertical size={14} />
                                        </button>
                                        {openMenuId === video._id && (
                                            <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-lg border border-ink-100 bg-white py-1 shadow-lg">
                                                <button
                                                    onClick={() => {
                                                        setFormState({ isOpen: true, video });
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
                                                >
                                                    <Pencil size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDelete(video);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 p-4">
                                <div>
                                    <h3 className="line-clamp-1 font-display text-sm font-semibold text-ink-900">
                                        {video.title}
                                    </h3>
                                    <p className="mt-0.5 font-mono text-xs text-ink-400">
                                        {formatTimestamp(video.durationSeconds)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Link to={`/admin/videos/${video._id}`}>
                                        <Button variant="secondary" size="sm">
                                            <ListChecks size={14} />
                                            Questions
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setAssignState({ isOpen: true, video })}
                                    >
                                        <Users size={14} />
                                        Assign
                                    </Button>
                                    <Button
                                        variant={video.published ? 'ghost' : 'accent'}
                                        size="sm"
                                        isLoading={togglePublish.isPending}
                                        onClick={() => togglePublish.mutate({ id: video._id, published: !video.published })}
                                    >
                                        {video.published ? 'Unpublish' : 'Publish'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <VideoFormModal
                isOpen={formState.isOpen}
                onClose={() => setFormState({ isOpen: false, video: null })}
                onSubmit={handleCreateOrUpdate}
                isSubmitting={createVideo.isPending || updateVideo.isPending}
                initialValues={formState.video}
            />

            <AssignLearnersModal
                isOpen={assignState.isOpen}
                onClose={() => setAssignState({ isOpen: false, video: null })}
                video={assignState.video}
                isSubmitting={createAssignments.isPending}
                onAssign={(learnerIds) =>
                    createAssignments.mutateAsync({ video: assignState.video._id, learnerIds })
                }
            />
        </Layout>
    );
}