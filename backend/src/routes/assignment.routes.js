import { Router } from 'express';
import * as assignmentController from '../controllers/assignment.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import {
    createAssignmentSchema,
    assignmentIdParamSchema,
    listAssignmentsQuerySchema,
} from '../validators/assignment.validator.js';

const router = Router();

router.get('/learners', protect, restrictTo('admin'), assignmentController.listLearners);

router.post(
    '/',
    protect,
    restrictTo('admin'),
    validate(createAssignmentSchema),
    assignmentController.createAssignments,
);

router.get(
    '/',
    protect,
    restrictTo('admin'),
    validate(listAssignmentsQuerySchema),
    assignmentController.listAssignments,
);

router.delete(
    '/:id',
    protect,
    restrictTo('admin'),
    validate(assignmentIdParamSchema),
    assignmentController.deleteAssignment,
);

export default router;