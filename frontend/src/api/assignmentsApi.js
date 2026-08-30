import axiosClient from './axiosClient';

export const assignmentsApi = {
    listLearners: () => axiosClient.get('/assignments/learners'),

    create: (payload) =>
        axiosClient.post('/assignments', payload),

    list: (params) =>
        axiosClient.get('/assignments', { params }),

    remove: (id) =>
        axiosClient.delete(`/assignments/${id}`),
};
