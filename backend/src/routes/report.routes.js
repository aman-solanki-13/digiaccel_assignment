import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/overview', protect, restrictTo('admin'), reportController.getOverview);
router.get('/videos/:videoId', protect, restrictTo('admin'), reportController.getVideoReport);
router.get('/learners/:learnerId', protect, restrictTo('admin'), reportController.getLearnerReport);

export default router;