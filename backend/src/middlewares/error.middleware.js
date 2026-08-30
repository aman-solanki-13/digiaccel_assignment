import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
    next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    let error = err;

    if (err.name === 'CastError') {
        error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        error = ApiError.conflict(`Duplicate value for field: ${field}`);
    }

    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map((e) => ({
            path: e.path,
            message: e.message,
        }));
        error = ApiError.badRequest('Validation failed', details);
    }

    // multer errors (file too large, unexpected field, etc.)
    if (err.name === 'MulterError') {
        const message =
            err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : `Upload error: ${err.message}`;
        error = ApiError.badRequest(message);
    }

    const statusCode = error.statusCode || 500;
    const message = error.isOperational ? error.message : 'Something went wrong on our end';

    if (!error.isOperational) {
        // eslint-disable-next-line no-console
        console.error('[unhandled error]', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        details: error.details || undefined,
        stack: env === 'development' ? err.stack : undefined,
    });
};