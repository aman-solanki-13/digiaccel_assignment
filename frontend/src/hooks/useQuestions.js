import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '../api/questionsApi';

export function useQuestions(videoId) {
    return useQuery({
        queryKey: ['videos', videoId, 'questions'],
        queryFn: () => questionsApi.list(videoId).then((res) => res.data.questions),
        enabled: Boolean(videoId),
        // questions are the backbone of playback timing — keep them fresh, never stale-serve mid-edit
        staleTime: 0,
    });
}

export function useCreateQuestion(videoId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => questionsApi.create(videoId, payload).then((res) => res.data.question),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos', videoId, 'questions'] }),
    });
}

export function useUpdateQuestion(videoId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            questionsApi.update(videoId, id, payload).then((res) => res.data.question),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos', videoId, 'questions'] }),
    });
}

export function useDeleteQuestion(videoId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => questionsApi.remove(videoId, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos', videoId, 'questions'] }),
    });
}