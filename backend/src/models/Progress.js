import mongoose from 'mongoose';

const { Schema } = mongoose;

const progressSchema = new Schema(
    {
        learner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: 'Video',
            required: true,
        },
        lastWatchedTimestamp: {
            type: Number,
            default: 0,
            min: 0,
        },
        completionPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

// one progress record per learner per video
progressSchema.index({ learner: 1, video: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);