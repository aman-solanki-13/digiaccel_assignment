import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const submitResponseSchema = z.object({
    params: z.object({
        videoId: objectId,
        questionId: objectId,
    }),
    body: z.object({
        answer: z.union([z.string(), z.array(z.string())]),
    }),
});

export const videoIdParamSchema = z.object({
    params: z.object({ videoId: objectId }),
});