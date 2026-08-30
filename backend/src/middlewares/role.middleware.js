import { ApiError } from '../utils/ApiError.js';

/**
 * Restricts a route to the given roles. Must run after `protect`.
 * Usage: restrictTo('admin') or restrictTo('admin', 'learner')
 */
export const restrictTo = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }
    return next();
};