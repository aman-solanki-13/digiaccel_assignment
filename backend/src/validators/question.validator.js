import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const optionSchema = z.object({
    id: z.string().trim().min(1),
    text: z.string().trim().min(1),
});

// shared refinement: choice questions need options + a correctAnswer that
// references those option ids; short_answer needs a plain string answer.
const baseQuestionBody = z.object({
    timestamp: z.number().min(0, 'Timestamp must be >= 0'),
    type: z.enum(['single_choice', 'multiple_choice', 'short_answer']),
    text: z.string().trim().min(1, 'Question text is required'),
    options: z.array(optionSchema).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]),
});

function refineQuestionShape(data, ctx) {
    const { type, options, correctAnswer } = data;

    if (type === 'single_choice' || type === 'multiple_choice') {
        if (!options || options.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['options'],
                message: 'Choice questions need at least 2 options',
            });
            return;
        }
        const optionIds = options.map((o) => o.id);
        const answers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

        if (type === 'single_choice' && answers.length !== 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['correctAnswer'],
                message: 'single_choice requires exactly one correct answer',
            });
        }

        const invalid = answers.filter((a) => !optionIds.includes(a));
        if (invalid.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['correctAnswer'],
                message: `correctAnswer references unknown option id(s): ${invalid.join(', ')}`,
            });
        }
    }

    if (type === 'short_answer' && typeof correctAnswer !== 'string') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['correctAnswer'],
            message: 'short_answer requires a string correctAnswer',
        });
    }
}

export const createQuestionSchema = z.object({
    params: z.object({ videoId: objectId }),
    body: baseQuestionBody.superRefine(refineQuestionShape),
});

export const updateQuestionSchema = z.object({
    params: z.object({ id: objectId }),
    body: baseQuestionBody.partial().superRefine((data, ctx) => {
        // only run the shape refinement if enough fields are present to judge it
        if (data.type) refineQuestionShape(data, ctx);
    }),
});

export const questionIdParamSchema = z.object({
    params: z.object({ id: objectId }),
});

export const videoIdParamSchema = z.object({
    params: z.object({ videoId: objectId }),
});