import * as reportService from '../services/report.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getVideoReport = catchAsync(async (req, res) => {
    const report = await reportService.getVideoReport(req.params.videoId);
    res.status(200).json({ success: true, data: report });
});

export const getLearnerReport = catchAsync(async (req, res) => {
    const report = await reportService.getLearnerReport(req.params.learnerId);
    res.status(200).json({ success: true, data: { rows: report } });
});

export const getOverview = catchAsync(async (req, res) => {
    const overview = await reportService.getOverview();
    res.status(200).json({ success: true, data: overview });
});