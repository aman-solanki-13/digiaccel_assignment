/**
 * Wraps an async route handler so rejected promises are forwarded to next(),
 * avoiding repetitive try/catch blocks in every controller.
 */
export const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;