import axiosClient from './axiosClient';

export const responsesApi = {
    submit: (videoId, questionId, answer) =>
        axiosClient.post(`/videos/${videoId}/questions/${questionId}/responses`, { answer }),
    listForVideo: (videoId) => axiosClient.get(`/videos/${videoId}/responses`),
};