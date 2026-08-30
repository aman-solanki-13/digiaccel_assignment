import * as progressService from '../services/progress.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getProgress = catchAsync(async (req, res) => {
    const progress = await progressService.getProgress(req.params.videoId, req.user._id);
    res.status(200).json({ success: true, data: { progress } });
});

export const upsertProgress = catchAsync(async (req, res) => {
    const progress = await progressService.upsertProgress(req.params.videoId, req.user._id, req.body);
    res.status(200).json({ success: true, data: { progress } });
});