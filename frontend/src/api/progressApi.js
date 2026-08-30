import axiosClient from './axiosClient';

export const progressApi = {
    get: (videoId) => axiosClient.get(`/videos/${videoId}/progress`),
    upsert: (videoId, payload) => axiosClient.put(`/videos/${videoId}/progress`, payload),
};