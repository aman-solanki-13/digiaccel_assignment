import mongoose from 'mongoose';

const { Schema } = mongoose;

const videoSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        thumbnail: {
            type: String,
            trim: true,
            default: '',
        },
        videoUrl: {
            type: String,
            required: [true, 'Video URL is required'],
            trim: true,
        },
        durationSeconds: {
            type: Number,
            min: 0,
            default: 0,
        },
        published: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true },
);

videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ published: 1 });

export default mongoose.model('Video', videoSchema);