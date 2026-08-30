import Response from '../models/Response.js';
import Question from '../models/Question.js';
import Assignment from '../models/Assignment.js';
import { ApiError } from '../utils/ApiError.js';

function gradeAnswer(question, answer) {
    if (question.type === 'short_answer') {
        const expected = String(question.correctAnswer).trim().toLowerCase();
        const given = String(answer).trim().toLowerCase();

        return expected === given;
    }

    const expected = Array.isArray(question.correctAnswer)
        ? [...question.correctAnswer].sort()
        : [question.correctAnswer];

    const given = Array.isArray(answer)
        ? [...answer].sort()
        : [answer];

    if (expected.length !== given.length) {
        return false;
    }

    return expected.every((value, index) => value === given[index]);
}

/**
 * Submit a learner's answer to a timestamp question.
 *
 * A learner may answer each question only once.
 *
 * The rule is enforced both:
 * 1. Here in the service layer.
 * 2. By the unique MongoDB index on learner + question.
 *
 * The second protection prevents duplicate submissions caused by
 * simultaneous requests/race conditions.
 */
export async function submitResponse(videoId, questionId, learnerId, answer) {
    const assignment = await Assignment.findOne({
        video: videoId,
        learner: learnerId,
    });

    if (!assignment) {
        throw ApiError.forbidden('This video is not assigned to you');
    }

    const question = await Question.findOne({
        _id: questionId,
        video: videoId,
    });

    if (!question) {
        throw ApiError.notFound('Question not found for this video');
    }

    // A learner can submit this question only once.
    const existingResponse = await Response.findOne({
        learner: learnerId,
        question: questionId,
    });

    if (existingResponse) {
        throw ApiError.conflict('You have already answered this question');
    }

    const isCorrect = gradeAnswer(question, answer);

    try {
        const response = await Response.create({
            learner: learnerId,
            video: videoId,
            question: questionId,
            answer,
            isCorrect,
            answeredAt: new Date(),
        });

        return response;
    } catch (error) {
        // The unique MongoDB index is the final protection against
        // two requests arriving at almost exactly the same time.
        if (error.code === 11000) {
            throw ApiError.conflict('You have already answered this question');
        }

        throw error;
    }
}

export async function listResponsesForLearner(videoId, learnerId) {
    return Response.find({
        video: videoId,
        learner: learnerId,
    });
}
