import { Router } from 'express';
import * as questionController from '../controllers/question.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import {
    createQuestionSchema,
    updateQuestionSchema,
    questionIdParamSchema,
    videoIdParamSchema,
} from '../validators/question.validator.js';

// mergeParams so :videoId from the parent router (video.routes.js) is visible here
const router = Router({ mergeParams: true });

router.post(
    '/',
    protect,
    restrictTo('admin'),
    validate(createQuestionSchema),
    questionController.createQuestion,
);

router.get(
    '/',
    protect,
    validate(videoIdParamSchema),
    questionController.listQuestionsForVideo,
);

router.patch(
    '/:id',
    protect,
    restrictTo('admin'),
    validate(updateQuestionSchema),
    questionController.updateQuestion,
);

router.delete(
    '/:id',
    protect,
    restrictTo('admin'),
    validate(questionIdParamSchema),
    questionController.deleteQuestion,
);

export default router;