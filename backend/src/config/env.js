import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of required) {
    if (!process.env[key] && process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.warn(`[config] Warning: environment variable ${key} is not set`);
    }
}

export const env = process.env.NODE_ENV || 'development';
export const port = parseInt(process.env.PORT, 10) || 4000;
export const mongodbUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/video-learning-platform';

export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
};

export const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

export const rateLimitConfig = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
};

export const uploadLimits = {
    maxVideoSizeMb: parseInt(process.env.MAX_VIDEO_SIZE_MB, 10) || 500,
    maxImageSizeMb: parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 5,
};