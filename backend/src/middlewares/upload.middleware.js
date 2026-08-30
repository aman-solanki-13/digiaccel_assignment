import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { uploadsDir } from '../utils/paths.js';
import { uploadLimits } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

function makeStorage(subfolder) {
    return multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(uploadsDir, subfolder)),
        filename: (req, file, cb) => {
            // random filename — never trust/reuse the client's original filename on disk
            const ext = path.extname(file.originalname) || '';
            cb(null, `${crypto.randomUUID()}${ext}`);
        },
    });
}

const videoFileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
        return cb(ApiError.badRequest('Only video files are allowed'));
    }
    return cb(null, true);
};

const imageFileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(ApiError.badRequest('Only image files are allowed'));
    }
    return cb(null, true);
};

export const uploadVideoFile = multer({
    storage: makeStorage('videos'),
    fileFilter: videoFileFilter,
    limits: { fileSize: uploadLimits.maxVideoSizeMb * 1024 * 1024 },
}).single('video');

export const uploadThumbnailFile = multer({
    storage: makeStorage('thumbnails'),
    fileFilter: imageFileFilter,
    limits: { fileSize: uploadLimits.maxImageSizeMb * 1024 * 1024 },
}).single('thumbnail');