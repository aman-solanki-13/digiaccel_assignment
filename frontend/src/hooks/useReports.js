import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reportsApi';

export function useOverviewReport() {
    return useQuery({
        queryKey: ['reports', 'overview'],
        queryFn: () => reportsApi.overview().then((res) => res.data),
    });
}

export function useVideoReport(videoId) {
    return useQuery({
        queryKey: ['reports', 'video', videoId],
        queryFn: () => reportsApi.videoReport(videoId).then((res) => res.data),
        enabled: Boolean(videoId),
    });
}

export function useLearnerReport(learnerId) {
    return useQuery({
        queryKey: ['reports', 'learner', learnerId],
        queryFn: () => reportsApi.learnerReport(learnerId).then((res) => res.data.rows),
        enabled: Boolean(learnerId),
    });
}