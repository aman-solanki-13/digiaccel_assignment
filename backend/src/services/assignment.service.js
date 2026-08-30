import Assignment from '../models/Assignment.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Bulk-assigns a video to one or more learners. Already-assigned learners
 * are skipped silently rather than erroring the whole batch.
 */
export async function createAssignments(videoId, learnerIds, adminId) {
    const video = await Video.findById(videoId);
    if (!video) {
        throw ApiError.notFound('Video not found');
    }

    const learners = await User.find({ _id: { $in: learnerIds }, role: 'learner' });
    if (learners.length === 0) {
        throw ApiError.badRequest('No valid learner ids were provided');
    }

    const existing = await Assignment.find({
        video: videoId,
        learner: { $in: learners.map((l) => l._id) },
    }).select('learner');
    const alreadyAssigned = new Set(existing.map((a) => a.learner.toString()));

    const toCreate = learners
        .filter((l) => !alreadyAssigned.has(l._id.toString()))
        .map((l) => ({ video: videoId, learner: l._id, assignedBy: adminId }));

    const created = toCreate.length > 0 ? await Assignment.insertMany(toCreate) : [];

    return {
        created,
        skipped: learners.length - toCreate.length,
    };
}

export async function listAssignments(filter) {
    const query = {};
    if (filter.video) query.video = filter.video;
    if (filter.learner) query.learner = filter.learner;

    return Assignment.find(query)
        .populate('video', 'title thumbnail published')
        .populate('learner', 'name email')
        .sort({ createdAt: -1 });
}

export async function deleteAssignment(id) {
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
        throw ApiError.notFound('Assignment not found');
    }
}

export async function listLearners() {
    return User.find({ role: 'learner' }).select('name email');
}