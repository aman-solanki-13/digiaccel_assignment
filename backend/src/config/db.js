import mongoose from 'mongoose';
import { mongodbUri } from './env.js';

export async function connectDB() {
    mongoose.set('strictQuery', true);

    try {
        await mongoose.connect(mongodbUri);
        // eslint-disable-next-line no-console
        console.log(`[db] Connected to MongoDB: ${mongoose.connection.name}`);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[db] MongoDB connection failed:', err.message);
        process.exit(1);
    }

    mongoose.connection.on('disconnected', () => {
        // eslint-disable-next-line no-console
        console.warn('[db] MongoDB disconnected');
    });
}

export default connectDB;