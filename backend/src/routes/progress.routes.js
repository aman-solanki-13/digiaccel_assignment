import { Router } from 'express';
import * as progressController from '../controllers/progress.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import {
    upsertProgressSchema,
    videoIdParamSchema,
} from '../validators/progress.validator.js';

// mounted at /videos/:videoId/progress — mergeParams exposes videoId here
const router = Router({ mergeParams: true });

router.get(
    '/',
    protect,
    restrictTo('learner'),
    validate(videoIdParamSchema),
    progressController.getProgress,
);

router.put(
    '/',
    protect,
    restrictTo('learner'),
    validate(upsertProgressSchema),
    progressController.upsertProgress,
);

export default router;