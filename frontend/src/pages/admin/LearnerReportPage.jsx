import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../components/common/Layout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useLearnerReport } from '../../hooks/useReports';

export function LearnerReportPage() {
    const { learnerId } = useParams();
    const navigate = useNavigate();
    const { data: rows, isLoading } = useLearnerReport(learnerId);

    return (
        <Layout>
            <button
                onClick={() => navigate('/admin/reports')}
                className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
            >
                <ArrowLeft size={16} />
                Back to reports
            </button>

            <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Learner report</h1>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={28} />
                </div>
            ) : !rows?.length ? (
                <EmptyState title="No assignments" description="This learner hasn't been assigned any videos." />
            ) : (
                <div className="space-y-3">
                    {rows.map((row) => (
                        <Card key={row.video._id} className="flex items-center gap-4 p-4">
                            <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                                {row.video.thumbnail && (
                                    <img src={row.video.thumbnail} alt={row.video.title} className="h-full w-full object-cover" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-ink-900">{row.video.title}</p>
                                <div className="mt-1 flex items-center gap-3">
                                    <div className="w-32">
                                        <ProgressBar value={row.completionPercentage} />
                                    </div>
                                    <span className="text-xs text-ink-400">{Math.round(row.completionPercentage)}%</span>
                                </div>
                            </div>
                            <Badge tone={row.completed ? 'success' : 'neutral'}>
                                {row.completed ? 'Completed' : 'In progress'}
                            </Badge>
                            <span className="font-mono text-xs text-ink-500">
                                {row.correctCount}/{row.questionsAnswered} correct
                            </span>
                        </Card>
                    ))}
                </div>
            )}
        </Layout>
    );
}