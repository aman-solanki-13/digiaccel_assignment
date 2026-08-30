import { Router } from 'express';
import * as responseController from '../controllers/response.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import {
    submitResponseSchema,
    videoIdParamSchema,
} from '../validators/response.validator.js';

// mounted at /videos/:videoId — mergeParams exposes videoId here
const router = Router({ mergeParams: true });

router.post(
    '/questions/:questionId/responses',
    protect,
    restrictTo('learner'),
    validate(submitResponseSchema),
    responseController.submitResponse,
);

router.get(
    '/responses',
    protect,
    restrictTo('learner'),
    validate(videoIdParamSchema),
    responseController.listResponsesForLearner,
);

export default router;