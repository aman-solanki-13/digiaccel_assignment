import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { responsesApi } from '../api/responsesApi';

export function useResponses(videoId) {
    return useQuery({
        queryKey: ['responses', videoId],
        queryFn: () => responsesApi.listForVideo(videoId).then((res) => res.data.responses),
        enabled: Boolean(videoId),
    });
}

export function useSubmitResponse(videoId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ questionId, answer }) =>
            responsesApi.submit(videoId, questionId, answer).then((res) => res.data.response),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['responses', videoId] }),
    });
}