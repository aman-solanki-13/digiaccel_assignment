import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { Layout } from '../../components/common/Layout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { QuestionFormModal } from "./QuestionFormModal";


import { AdminVideoPreview } from "./AdminVideoPreview";

import { useVideo } from '../../hooks/useVideos';
import {
    useQuestions,
    useCreateQuestion,
    useUpdateQuestion,
    useDeleteQuestion,
} from '../../hooks/useQuestions';
import { formatTimestamp, resolveMediaUrl } from '../../lib/utils';

const typeLabels = {
    single_choice: 'Single choice',
    multiple_choice: 'Multiple choice',
    short_answer: 'Short answer',
};

export function QuestionBuilder() {
    const { videoId } = useParams();
    const navigate = useNavigate();

    const { data: video } = useVideo(videoId);
    const { data: questions, isLoading } = useQuestions(videoId);
    const createQuestion = useCreateQuestion(videoId);
    const updateQuestion = useUpdateQuestion(videoId);
    const deleteQuestion = useDeleteQuestion(videoId);

    const [formState, setFormState] = useState({ isOpen: false, question: null, presetTimestamp: 0 });

    const openNewAt = (timestamp) =>
        setFormState({ isOpen: true, question: null, presetTimestamp: timestamp });
    const openEdit = (question) =>
        setFormState({ isOpen: true, question, presetTimestamp: 0 });
    const closeForm = () => setFormState({ isOpen: false, question: null, presetTimestamp: 0 });

    const handleSubmit = async (data) => {
        if (formState.question) {
            await updateQuestion.mutateAsync({ id: formState.question._id, payload: data });
        } else {
            await createQuestion.mutateAsync(data);
        }
    };

    const handleDelete = async (question) => {
        if (!window.confirm('Delete this question? Learner responses to it will be removed too.')) return;
        await deleteQuestion.mutateAsync(question._id);
    };

    return (
        <Layout>
            <button
                onClick={() => navigate('/admin/videos')}
                className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
            >
                <ArrowLeft size={16} />
                Back to videos
            </button>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-ink-900">{video?.title ?? 'Questions'}</h1>
                    <p className="mt-1 text-sm text-ink-500">
                        Scrub to a moment and click "Add question here" — or click an existing marker to edit it.
                    </p>
                </div>
                <Button onClick={() => openNewAt(0)}>
                    <Plus size={16} />
                    Add question
                </Button>
            </div>

            {video?.videoUrl && (
                <div className="mb-6">
                    <AdminVideoPreview
                        videoUrl={resolveMediaUrl(video.videoUrl)}
                        questions={questions ?? []}
                        onAddQuestionAt={openNewAt}
                        onMarkerClick={openEdit}
                    />
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={28} />
                </div>
            ) : !questions?.length ? (
                <EmptyState
                    title="No questions yet"
                    description="Questions pause the video at their timestamp and quiz the learner."
                    action={
                        <Button onClick={() => openNewAt(0)}>
                            <Plus size={16} />
                            Add question
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {questions.map((q) => (
                        <Card key={q._id} className="flex items-start justify-between gap-4 p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-ink-900 font-mono text-xs font-semibold text-white">
                                    {formatTimestamp(q.timestamp)}
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <Badge tone="brand">{typeLabels[q.type]}</Badge>
                                    </div>
                                    <p className="text-sm font-medium text-ink-900">{q.text}</p>
                                    {q.options && (
                                        <ul className="mt-1.5 flex flex-wrap gap-1.5">
                                            {q.options.map((o) => (
                                                <li
                                                    key={o.id}
                                                    className={`rounded-md px-2 py-0.5 text-xs ${(Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]).includes(o.id)
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-ink-50 text-ink-500'
                                                        }`}
                                                >
                                                    {o.text}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-1">
                                <button onClick={() => openEdit(q)} className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => handleDelete(q)} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <QuestionFormModal
                isOpen={formState.isOpen}
                onClose={closeForm}
                onSubmit={handleSubmit}
                isSubmitting={createQuestion.isPending || updateQuestion.isPending}
                initialValues={formState.question}
                presetTimestamp={formState.presetTimestamp}
            />
        </Layout>
    );
}