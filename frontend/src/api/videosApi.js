import axiosClient from './axiosClient';

export const videosApi = {
    list: () => axiosClient.get('/videos'),
    get: (id) => axiosClient.get(`/videos/${id}`),
    create: (payload) => axiosClient.post('/videos', payload),
    update: (id, payload) => axiosClient.patch(`/videos/${id}`, payload),
    togglePublish: (id, published) => axiosClient.patch(`/videos/${id}/publish`, { published }),
    remove: (id) => axiosClient.delete(`/videos/${id}`),
};