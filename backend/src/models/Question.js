import mongoose from 'mongoose';

const { Schema } = mongoose;

const optionSchema = new Schema(
    {
        id: { type: String, required: true }, // e.g. "a", "b", "c"
        text: { type: String, required: true, trim: true },
    },
    { _id: false },
);

const questionSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: 'Video',
            required: true,
        },
        timestamp: {
            type: Number, // seconds into the video when this question should appear
            required: [true, 'Timestamp is required'],
            min: 0,
        },
        type: {
            type: String,
            enum: ['single_choice', 'multiple_choice', 'short_answer'],
            required: true,
        },
        text: {
            type: String,
            required: [true, 'Question text is required'],
            trim: true,
        },
        // used for single_choice / multiple_choice only
        options: {
            type: [optionSchema],
            default: undefined,
        },
        // option id(s) for choice questions, or the expected string for short_answer
        correctAnswer: {
            type: Schema.Types.Mixed, // String | String[]
            required: true,
        },
    },
    { timestamps: true },
);

questionSchema.index({ video: 1, timestamp: 1 });

export default mongoose.model('Question', questionSchema);