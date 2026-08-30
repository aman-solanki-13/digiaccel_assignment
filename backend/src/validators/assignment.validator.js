import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createAssignmentSchema = z.object({
    body: z.object({
        video: objectId,
        // accept one or many learners so admins can bulk-assign
        learnerIds: z.array(objectId).min(1, 'At least one learner is required'),
    }),
});

export const assignmentIdParamSchema = z.object({
    params: z.object({ id: objectId }),
});

export const listAssignmentsQuerySchema = z.object({
    query: z.object({
        video: objectId.optional(),
        learner: objectId.optional(),
    }),
});