import * as responseService from '../services/response.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const submitResponse = catchAsync(async (req, res) => {
    const { videoId, questionId } = req.params;
    const response = await responseService.submitResponse(
        videoId,
        questionId,
        req.user._id,
        req.body.answer,
    );
    res.status(200).json({ success: true, data: { response } });
});

export const listResponsesForLearner = catchAsync(async (req, res) => {
    const responses = await responseService.listResponsesForLearner(req.params.videoId, req.user._id);
    res.status(200).json({ success: true, data: { responses } });
});