import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../api/progressApi';

export function useProgress(videoId) {
    return useQuery({
        queryKey: ['progress', videoId],
        queryFn: () => progressApi.get(videoId).then((res) => res.data.progress),
        enabled: Boolean(videoId),
    });
}

export function useUpsertProgress(videoId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => progressApi.upsert(videoId, payload).then((res) => res.data.progress),
        onSuccess: (progress) => {
            queryClient.setQueryData(['progress', videoId], progress);
        },
    });
}