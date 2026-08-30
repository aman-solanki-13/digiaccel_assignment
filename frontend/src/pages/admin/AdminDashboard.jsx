import { Video, Users, CheckCircle2, Layers } from 'lucide-react';
import { Layout } from '../../components/common/Layout';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { useOverviewReport } from '../../hooks/useReports';

const stats = [
    { key: 'totalVideos', label: 'Total videos', icon: Video, tone: 'text-brand-600 bg-brand-50' },
    { key: 'publishedVideos', label: 'Published', icon: Layers, tone: 'text-emerald-600 bg-emerald-50' },
    { key: 'totalAssignments', label: 'Assignments', icon: Users, tone: 'text-accent-600 bg-accent-50' },
    {
        key: 'completedAssignments',
        label: 'Completions',
        icon: CheckCircle2,
        tone: 'text-purple-600 bg-purple-50',
    },
];

export function AdminDashboard() {
    const { data, isLoading } = useOverviewReport();

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-ink-900">Overview</h1>
                <p className="mt-1 text-sm text-ink-500">A snapshot of your learning platform.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={28} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map(({ key, label, icon: Icon, tone }) => (
                        <Card key={key} className="p-5">
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                                <Icon size={18} />
                            </div>
                            <p className="font-display text-2xl font-bold text-ink-900">{data?.[key] ?? 0}</p>
                            <p className="text-sm text-ink-500">{label}</p>
                        </Card>
                    ))}
                </div>
            )}
        </Layout>
    );
}