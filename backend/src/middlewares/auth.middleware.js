import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Verifies the JWT in the Authorization header and attaches the
 * authenticated user (minus password) to req.user.
 */
export const protect = catchAsync(async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        throw ApiError.unauthorized('You are not logged in. Please log in to continue.');
    }

    const token = header.split(' ')[1];

    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (err) {
        throw ApiError.unauthorized('Invalid or expired token. Please log in again.');
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
        throw ApiError.unauthorized('The user belonging to this token no longer exists.');
    }

    req.user = user;
    next();
});