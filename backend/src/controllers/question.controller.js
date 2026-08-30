import * as questionService from '../services/question.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createQuestion = catchAsync(async (req, res) => {
    const question = await questionService.createQuestion(req.params.videoId, req.body);
    res.status(201).json({ success: true, data: { question } });
});

export const listQuestionsForVideo = catchAsync(async (req, res) => {
    const questions = await questionService.listQuestionsForVideo(req.params.videoId);
    res.status(200).json({ success: true, data: { questions } });
});

export const updateQuestion = catchAsync(async (req, res) => {
    const question = await questionService.updateQuestion(req.params.id, req.body);
    res.status(200).json({ success: true, data: { question } });
});

export const deleteQuestion = catchAsync(async (req, res) => {
    await questionService.deleteQuestion(req.params.id);
    res.status(204).send();
});