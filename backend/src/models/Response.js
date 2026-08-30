import mongoose from 'mongoose';

const { Schema } = mongoose;

const responseSchema = new Schema(
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
        question: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        },
        answer: {
            type: Schema.Types.Mixed, // String | String[]
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
        answeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

// a learner's answer to a given question is upserted, not duplicated
responseSchema.index({ learner: 1, question: 1 }, { unique: true });

export default mongoose.model('Response', responseSchema);