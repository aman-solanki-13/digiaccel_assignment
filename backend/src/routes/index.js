import { Router } from 'express';
import authRoutes from './auth.routes.js';
import videoRoutes from './video.routes.js';
import assignmentRoutes from './assignment.routes.js';
import reportRoutes from './report.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/reports', reportRoutes);
router.use('/uploads', uploadRoutes);

export default router;