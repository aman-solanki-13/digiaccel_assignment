import Progress from '../models/Progress.js';
import Assignment from '../models/Assignment.js';
import { ApiError } from '../utils/ApiError.js';

export async function getProgress(videoId, learnerId) {
    const progress = await Progress.findOne({ video: videoId, learner: learnerId });
    // no progress yet is a valid state (learner hasn't started) — return defaults
    if (!progress) {
        return {
            video: videoId,
            learner: learnerId,
            lastWatchedTimestamp: 0,
            completionPercentage: 0,
            completed: false,
            completedAt: null,
        };
    }
    return progress;
}

/**
 * Upserts progress for a learner/video pair. Requires the video to be
 * assigned to the learner. completedAt is stamped the first time
 * `completed` flips true, and never overwritten on subsequent saves.
 */
export async function upsertProgress(videoId, learnerId, data) {
    const assignment = await Assignment.findOne({ video: videoId, learner: learnerId });
    if (!assignment) {
        throw ApiError.forbidden('This video is not assigned to you');
    }

    const existing = await Progress.findOne({ video: videoId, learner: learnerId });

    const update = {
        lastWatchedTimestamp: data.lastWatchedTimestamp,
        completionPercentage: data.completionPercentage,
        completed: data.completed,
    };

    if (data.completed && !(existing && existing.completed)) {
        update.completedAt = new Date();
    }

    const progress = await Progress.findOneAndUpdate(
        { video: videoId, learner: learnerId },
        { $set: update },
        { new: true, upsert: true, runValidators: true },
    );

    return progress;
}