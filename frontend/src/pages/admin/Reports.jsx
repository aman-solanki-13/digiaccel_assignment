import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { Layout } from '../../components/common/Layout';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { initials } from '../../lib/utils';
import { useVideos } from '../../hooks/useVideos';
import { useVideoReport } from '../../hooks/useReports';

export function Reports() {
    const { data: videos } = useVideos();
    const [selectedVideoId, setSelectedVideoId] = useState('');
    const { data: report, isLoading } = useVideoReport(selectedVideoId);

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-ink-900">Reports</h1>
                <p className="mt-1 text-sm text-ink-500">Track learner progress and quiz accuracy per video.</p>
            </div>

            <Card className="mb-6 p-4">
                <Select
                    label="Select a video"
                    value={selectedVideoId}
                    onChange={(e) => setSelectedVideoId(e.target.value)}
                >
                    <option value="">Choose a video...</option>
                    {videos?.map((v) => (
                        <option key={v._id} value={v._id}>
                            {v.title}
                        </option>
                    ))}
                </Select>
            </Card>

            {!selectedVideoId ? (
                <EmptyState icon={BarChart3} title="Select a video" description="Pick a video above to see learner-by-learner progress." />
            ) : isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={28} />
                </div>
            ) : !report?.rows.length ? (
                <EmptyState title="No learners assigned" description="Assign this video to learners to start collecting data." />
            ) : (
                <Card className="overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                            <tr>
                                <th className="px-4 py-3">Learner</th>
                                <th className="px-4 py-3">Progress</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Quiz score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100">
                            {report.rows.map((row) => (
                                <tr key={row.learner._id}>
                                    <td className="px-4 py-3">
                                        <Link
                                            to={`/admin/reports/learners/${row.learner._id}`}
                                            className="flex items-center gap-2 hover:text-brand-600"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">
                                                {initials(row.learner.name)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-ink-900">{row.learner.name}</p>
                                                <p className="text-xs text-ink-400">{row.learner.email}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="w-32">
                                            <ProgressBar value={row.completionPercentage} />
                                            <p className="mt-1 text-xs text-ink-400">{Math.round(row.completionPercentage)}%</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge tone={row.completed ? 'success' : 'neutral'}>
                                            {row.completed ? 'Completed' : 'In progress'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-ink-600">
                                        {row.correctCount} / {row.questionsAnswered} correct
                                        <span className="ml-1 text-ink-400">({row.questionsTotal} total)</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </Layout>
    );
}