import { Router } from 'express';
import * as videoController from '../controllers/video.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import {
    createVideoSchema,
    updateVideoSchema,
    videoIdParamSchema,
    togglePublishSchema,
} from '../validators/video.validator.js';

import questionRoutes from './question.routes.js';
import responseRoutes from './response.routes.js';
import progressRoutes from './progress.routes.js';

const router = Router();

// nested resource routers — anything under /:videoId/* delegates onward
router.use('/:videoId/questions', questionRoutes);
router.use('/:videoId/progress', progressRoutes);
router.use('/:videoId', responseRoutes); // handles /:videoId/questions/:questionId/responses and /:videoId/responses

router.post(
    '/',
    protect,
    restrictTo('admin'),
    validate(createVideoSchema),
    videoController.createVideo,
);

router.get('/', protect, videoController.listVideos);

router.get('/:id', protect, validate(videoIdParamSchema), videoController.getVideo);

router.patch(
    '/:id',
    protect,
    restrictTo('admin'),
    validate(updateVideoSchema),
    videoController.updateVideo,
);

router.patch(
    '/:id/publish',
    protect,
    restrictTo('admin'),
    validate(togglePublishSchema),
    videoController.togglePublish,
);

router.delete(
    '/:id',
    protect,
    restrictTo('admin'),
    validate(videoIdParamSchema),
    videoController.deleteVideo,
);

export default router;