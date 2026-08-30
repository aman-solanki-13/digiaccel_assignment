import mongoose from 'mongoose';

const { Schema } = mongoose;

const assignmentSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: 'Video',
            required: true,
        },
        learner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true },
);

// a learner can only be assigned the same video once
assignmentSchema.index({ video: 1, learner: 1 }, { unique: true });

export default mongoose.model('Assignment', assignmentSchema);