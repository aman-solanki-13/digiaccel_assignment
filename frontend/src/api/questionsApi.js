import axiosClient from './axiosClient';

// Nested under the video in the backend: /videos/:videoId/questions[/:id]
export const questionsApi = {
    list: (videoId) => axiosClient.get(`/videos/${videoId}/questions`),
    create: (videoId, payload) => axiosClient.post(`/videos/${videoId}/questions`, payload),
    update: (videoId, id, payload) =>
        axiosClient.patch(`/videos/${videoId}/questions/${id}`, payload),
    remove: (videoId, id) => axiosClient.delete(`/videos/${videoId}/questions/${id}`),
};