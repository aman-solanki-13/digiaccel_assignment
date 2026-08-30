import Assignment from '../models/Assignment.js';
import Progress from '../models/Progress.js';
import Response from '../models/Response.js';
import Question from '../models/Question.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Per-video report: every assigned learner, their progress, and a
 * correct/total tally of their question responses.
 */
export async function getVideoReport(videoId) {
    const video = await Video.findById(videoId);
    if (!video) {
        throw ApiError.notFound('Video not found');
    }

    const [assignments, questionCount] = await Promise.all([
        Assignment.find({ video: videoId }).populate('learner', 'name email'),
        Question.countDocuments({ video: videoId }),
    ]);

    const learnerIds = assignments.map((a) => a.learner._id);

    const [progressRecords, responses] = await Promise.all([
        Progress.find({ video: videoId, learner: { $in: learnerIds } }),
        Response.find({ video: videoId, learner: { $in: learnerIds } }),
    ]);

    const progressByLearner = new Map(progressRecords.map((p) => [p.learner.toString(), p]));

    const rows = assignments.map((a) => {
        const learnerId = a.learner._id.toString();
        const progress = progressByLearner.get(learnerId);
        const learnerResponses = responses.filter((r) => r.learner.toString() === learnerId);
        const correctCount = learnerResponses.filter((r) => r.isCorrect).length;

        return {
            learner: a.learner,
            lastWatchedTimestamp: progress?.lastWatchedTimestamp ?? 0,
            completionPercentage: progress?.completionPercentage ?? 0,
            completed: progress?.completed ?? false,
            questionsAnswered: learnerResponses.length,
            questionsTotal: questionCount,
            correctCount,
        };
    });

    return { video, rows };
}

/**
 * Per-learner report: every video assigned to them, with progress and
 * response accuracy for each.
 */
export async function getLearnerReport(learnerId) {
    const assignments = await Assignment.find({ learner: learnerId }).populate(
        'video',
        'title thumbnail published',
    );
    const videoIds = assignments.map((a) => a.video._id);

    const [progressRecords, responses, questionCounts] = await Promise.all([
        Progress.find({ learner: learnerId, video: { $in: videoIds } }),
        Response.find({ learner: learnerId, video: { $in: videoIds } }),
        Question.aggregate([
            { $match: { video: { $in: videoIds } } },
            { $group: { _id: '$video', count: { $sum: 1 } } },
        ]),
    ]);

    const progressByVideo = new Map(progressRecords.map((p) => [p.video.toString(), p]));
    const questionCountByVideo = new Map(questionCounts.map((q) => [q._id.toString(), q.count]));

    return assignments.map((a) => {
        const videoId = a.video._id.toString();
        const progress = progressByVideo.get(videoId);
        const videoResponses = responses.filter((r) => r.video.toString() === videoId);

        return {
            video: a.video,
            lastWatchedTimestamp: progress?.lastWatchedTimestamp ?? 0,
            completionPercentage: progress?.completionPercentage ?? 0,
            completed: progress?.completed ?? false,
            questionsAnswered: videoResponses.length,
            questionsTotal: questionCountByVideo.get(videoId) ?? 0,
            correctCount: videoResponses.filter((r) => r.isCorrect).length,
        };
    });
}

export async function getOverview() {
    const [videoCount, publishedCount, assignmentCount, completedCount] = await Promise.all([
        Video.countDocuments(),
        Video.countDocuments({ published: true }),
        Assignment.countDocuments(),
        Progress.countDocuments({ completed: true }),
    ]);

    return {
        totalVideos: videoCount,
        publishedVideos: publishedCount,
        totalAssignments: assignmentCount,
        completedAssignments: completedCount,
    };
}