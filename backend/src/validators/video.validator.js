import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

// videoUrl/thumbnail are now either a full external URL or a path returned
// by our own /uploads endpoints (e.g. "/uploads/videos/<uuid>.mp4")
const mediaPath = z
    .string()
    .trim()
    .refine((val) => /^https?:\/\//.test(val) || val.startsWith('/uploads/'), {
        message: 'Must be a valid URL or an uploaded file path',
    });

export const createVideoSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1, 'Title is required'),
        description: z.string().trim().optional().default(''),
        thumbnail: mediaPath.optional().or(z.literal('')),
        videoUrl: mediaPath,
        durationSeconds: z.number().min(0).optional().default(0),
    }),
});

export const updateVideoSchema = z.object({
    params: z.object({ id: objectId }),
    body: z.object({
        title: z.string().trim().min(1).optional(),
        description: z.string().trim().optional(),
        thumbnail: mediaPath.optional().or(z.literal('')),
        videoUrl: mediaPath.optional(),
        durationSeconds: z.number().min(0).optional(),
    }),
});

export const videoIdParamSchema = z.object({
    params: z.object({ id: objectId }),
});

export const togglePublishSchema = z.object({
    params: z.object({ id: objectId }),
    body: z.object({
        published: z.boolean(),
    }),
});