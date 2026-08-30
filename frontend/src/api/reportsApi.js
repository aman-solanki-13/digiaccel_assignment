import axiosClient from './axiosClient';

export const reportsApi = {
    overview: () => axiosClient.get('/reports/overview'),
    videoReport: (videoId) => axiosClient.get(`/reports/videos/${videoId}`),
    learnerReport: (learnerId) => axiosClient.get(`/reports/learners/${learnerId}`),
};