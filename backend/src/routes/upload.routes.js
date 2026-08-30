import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import { uploadVideoFile, uploadThumbnailFile } from '../middlewares/upload.middleware.js';
import * as uploadController from '../controllers/upload.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Local-disk file uploads for video/thumbnail assets (admin only)
 */

/**
 * @swagger
 * /uploads/video:
 *   post:
 *     summary: Upload a video file (admin only)
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [video]
 *             properties:
 *               video: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: File stored; returns a URL to use as a video's videoUrl
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string, example: /uploads/videos/9b1e...-mp4 }
 *                     originalName: { type: string }
 *                     sizeBytes: { type: number }
 *       400:
 *         description: Missing file, wrong type, or file too large
 */
router.post('/video', protect, restrictTo('admin'), uploadVideoFile, uploadController.uploadVideo);

/**
 * @swagger
 * /uploads/thumbnail:
 *   post:
 *     summary: Upload a thumbnail image (admin only)
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [thumbnail]
 *             properties:
 *               thumbnail: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: File stored; returns a URL to use as a video's thumbnail
 */
router.post(
    '/thumbnail',
    protect,
    restrictTo('admin'),
    uploadThumbnailFile,
    uploadController.uploadThumbnail,
);

export default router;