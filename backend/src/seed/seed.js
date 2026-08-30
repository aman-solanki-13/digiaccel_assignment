import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Video from '../models/Video.js';
import Question from '../models/Question.js';
import Assignment from '../models/Assignment.js';
import Progress from '../models/Progress.js';
import Response from '../models/Response.js';

async function seed() {
    await connectDB();

    // eslint-disable-next-line no-console
    console.log('[seed] Clearing existing data...');
    await Promise.all([
        User.deleteMany({}),
        Video.deleteMany({}),
        Question.deleteMany({}),
        Assignment.deleteMany({}),
        Progress.deleteMany({}),
        Response.deleteMany({}),
    ]);

    // eslint-disable-next-line no-console
    console.log('[seed] Creating users...');
    const admin = await User.create({
        name: 'Ava Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
    });

    const learner1 = await User.create({
        name: 'Leo Learner',
        email: 'learner1@example.com',
        password: 'password123',
        role: 'learner',
    });

    const learner2 = await User.create({
        name: 'Lena Learner',
        email: 'learner2@example.com',
        password: 'password123',
        role: 'learner',
    });

    // eslint-disable-next-line no-console
    console.log('[seed] Creating a video with timestamp questions...');
    const video = await Video.create({
        title: 'Introduction to Photosynthesis',
        description: 'A short primer on how plants convert light into energy.',
        thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        durationSeconds: 596,
        published: true,
        createdBy: admin._id,
    });

    await Question.create([
        {
            video: video._id,
            timestamp: 10,
            type: 'single_choice',
            text: 'What pigment gives plants their green color?',
            options: [
                { id: 'a', text: 'Chlorophyll' },
                { id: 'b', text: 'Carotene' },
                { id: 'c', text: 'Melanin' },
            ],
            correctAnswer: 'a',
        },
        {
            video: video._id,
            timestamp: 30,
            type: 'multiple_choice',
            text: 'Which of these are inputs to photosynthesis?',
            options: [
                { id: 'a', text: 'Carbon dioxide' },
                { id: 'b', text: 'Water' },
                { id: 'c', text: 'Oxygen' },
                { id: 'd', text: 'Sunlight' },
            ],
            correctAnswer: ['a', 'b', 'd'],
        },
        {
            video: video._id,
            timestamp: 60,
            type: 'short_answer',
            text: 'What gas is released as a byproduct of photosynthesis?',
            correctAnswer: 'oxygen',
        },
    ]);

    // eslint-disable-next-line no-console
    console.log('[seed] Assigning video to learners...');
    await Assignment.create([
        { video: video._id, learner: learner1._id, assignedBy: admin._id },
        { video: video._id, learner: learner2._id, assignedBy: admin._id },
    ]);

    await Progress.create({
        video: video._id,
        learner: learner1._id,
        lastWatchedTimestamp: 35,
        completionPercentage: 40,
        completed: false,
    });

    // eslint-disable-next-line no-console
    console.log('[seed] Done. Sample credentials:');
    // eslint-disable-next-line no-console
    console.log('  Admin:    admin@example.com / password123');
    // eslint-disable-next-line no-console
    console.log('  Learner1: learner1@example.com / password123');
    // eslint-disable-next-line no-console
    console.log('  Learner2: learner2@example.com / password123');

    await mongoose.connection.close();
    process.exit(0);
}

seed().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[seed] Failed:', err);
    process.exit(1);
});