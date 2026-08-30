import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const uploadVideo = catchAsync(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No video file provided');
    res.status(201).json({
        success: true,
        data: {
            url: `/uploads/videos/${req.file.filename}`,
            originalName: req.file.originalname,
            sizeBytes: req.file.size,
        },
    });
});

export const uploadThumbnail = catchAsync(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No thumbnail file provided');
    res.status(201).json({
        success: true,
        data: {
            url: `/uploads/thumbnails/${req.file.filename}`,
            originalName: req.file.originalname,
            sizeBytes: req.file.size,
        },
    });
});