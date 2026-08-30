import Video from '../models/Video.js';
import Assignment from '../models/Assignment.js';
import Question from '../models/Question.js';
import Progress from '../models/Progress.js';
import Response from '../models/Response.js';
import { ApiError } from '../utils/ApiError.js';

export async function createVideo(data, adminId) {
    return Video.create({ ...data, createdBy: adminId });
}

/**
 * Admins see every video, no progress attached (progress is per-learner
 * and meaningless in aggregate here — the Reports pages cover that view).
 * Learners only see videos assigned to them (published only), each with
 * their own progress embedded so the dashboard can render completion
 * state without an extra round trip per card.
 */


export async function listVideos(user) {
    if (user.role === 'admin') {
        return Video.find().sort({ createdAt: -1 });
    }

    const assignments = await Assignment.find({ learner: user._id }).select('video');
    const videoIds = assignments.map((a) => a.video);

    const videos = await Video.find({ _id: { $in: videoIds }, published: true }).sort({
        createdAt: -1,
    });

    const progressRecords = await Progress.find({
        learner: user._id,
        video: { $in: videoIds },
    });
    const progressByVideo = new Map(progressRecords.map((p) => [p.video.toString(), p]));

    return videos.map((video) => {
        const progress = progressByVideo.get(video._id.toString());
        return {
            ...video.toObject(),
            progress: {
                lastWatchedTimestamp: progress?.lastWatchedTimestamp ?? 0,
                completionPercentage: progress?.completionPercentage ?? 0,
                completed: progress?.completed ?? false,
            },
        };
    });
}

export async function getVideoById(id, user) {
    const video = await Video.findById(id);
    if (!video) {
        throw ApiError.notFound('Video not found');
    }

    if (user.role === 'learner') {
        const assignment = await Assignment.findOne({ video: id, learner: user._id });
        if (!assignment || !video.published) {
            throw ApiError.forbidden('This video is not assigned to you');
        }
    }

    return video;
}

export async function updateVideo(id, updates) {
    const video = await Video.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });
    if (!video) {
        throw ApiError.notFound('Video not found');
    }
    return video;
}

export async function togglePublish(id, published) {
    const video = await Video.findByIdAndUpdate(id, { published }, { new: true });
    if (!video) {
        throw ApiError.notFound('Video not found');
    }
    return video;
}

export async function deleteVideo(id) {
    const video = await Video.findById(id);
    if (!video) {
        throw ApiError.notFound('Video not found');
    }

    await Promise.all([
        Question.deleteMany({ video: id }),
        Assignment.deleteMany({ video: id }),
        Progress.deleteMany({ video: id }),
        Response.deleteMany({ video: id }),
    ]);

    await video.deleteOne();
}