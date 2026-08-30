import axiosClient from './axiosClient';

// Content-Type is explicitly unset (not 'multipart/form-data') so the
// browser's XHR layer sets it itself, including the required boundary —
// setting it manually here would omit the boundary and break parsing.
export const uploadApi = {
    uploadVideo: (file, onProgress) => {
        const formData = new FormData();
        formData.append('video', file);
        return axiosClient.post('/uploads/video', formData, {
            headers: { 'Content-Type': undefined },
            onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
        });
    },
    uploadThumbnail: (file, onProgress) => {
        const formData = new FormData();
        formData.append('thumbnail', file);
        return axiosClient.post('/uploads/thumbnail', formData, {
            headers: { 'Content-Type': undefined },
            onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
        });
    },
};