import Question from '../models/Question.js';
import Video from '../models/Video.js';
import Response from '../models/Response.js';
import { ApiError } from '../utils/ApiError.js';

export async function createQuestion(videoId, data) {
    const video = await Video.findById(videoId);
    if (!video) {
        throw ApiError.notFound('Video not found');
    }
    return Question.create({ ...data, video: videoId });
}

export async function listQuestionsForVideo(videoId) {
    return Question.find({ video: videoId }).sort({ timestamp: 1 });
}

export async function getQuestionById(id) {
    const question = await Question.findById(id);
    if (!question) {
        throw ApiError.notFound('Question not found');
    }
    return question;
}

export async function updateQuestion(id, updates) {
    const question = await Question.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });
    if (!question) {
        throw ApiError.notFound('Question not found');
    }
    return question;
}

export async function deleteQuestion(id) {
    const question = await Question.findById(id);
    if (!question) {
        throw ApiError.notFound('Question not found');
    }
    await Response.deleteMany({ question: id });
    await question.deleteOne();
}
