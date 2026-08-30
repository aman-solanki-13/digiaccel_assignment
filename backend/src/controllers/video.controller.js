import * as videoService from '../services/video.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createVideo = catchAsync(async (req, res) => {
    const video = await videoService.createVideo(req.body, req.user._id);
    res.status(201).json({ success: true, data: { video } });
});

export const listVideos = catchAsync(async (req, res) => {
    const videos = await videoService.listVideos(req.user);
    res.status(200).json({ success: true, data: { videos } });
});

export const getVideo = catchAsync(async (req, res) => {
    const video = await videoService.getVideoById(req.params.id, req.user);
    res.status(200).json({ success: true, data: { video } });
});

export const updateVideo = catchAsync(async (req, res) => {
    const video = await videoService.updateVideo(req.params.id, req.body);
    res.status(200).json({ success: true, data: { video } });
});

export const togglePublish = catchAsync(async (req, res) => {
    const video = await videoService.togglePublish(req.params.id, req.body.published);
    res.status(200).json({ success: true, data: { video } });
});

export const deleteVideo = catchAsync(async (req, res) => {
    await videoService.deleteVideo(req.params.id);
    res.status(204).send();
});