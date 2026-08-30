import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const upsertProgressSchema = z.object({
    params: z.object({ videoId: objectId }),
    body: z.object({
        lastWatchedTimestamp: z.number().min(0),
        completionPercentage: z.number().min(0).max(100),
        completed: z.boolean().optional().default(false),
    }),
});

export const videoIdParamSchema = z.object({
    params: z.object({ videoId: objectId }),
});