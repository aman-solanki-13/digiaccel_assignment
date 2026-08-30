import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi } from '../api/videosApi';
import { useAuth } from '../context/AuthContext';

export function useVideos() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['videos', user?._id, user?.role],
        queryFn: () => videosApi.list().then((res) => res.data.videos),
        enabled: Boolean(user),
    });
}

export function useVideo(id) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['videos', user?._id, user?.role, id],
        queryFn: () => videosApi.get(id).then((res) => res.data.video),
        enabled: Boolean(user && id),
    });
}

export function useCreateVideo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) =>
            videosApi.create(payload).then((res) => res.data.video),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['videos'],
            });
        },
    });
}

export function useUpdateVideo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }) =>
            videosApi.update(id, payload).then((res) => res.data.video),

        onSuccess: (video) => {
            queryClient.invalidateQueries({
                queryKey: ['videos'],
            });

            queryClient.invalidateQueries({
                queryKey: ['videos', undefined, undefined, video._id],
            });
        },
    });
}

export function useTogglePublish() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, published }) =>
            videosApi
                .togglePublish(id, published)
                .then((res) => res.data.video),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['videos'],
            });
        },
    });
}

export function useDeleteVideo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => videosApi.remove(id),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['videos'],
            });
        },
    });
}
