import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validates req.{body,params,query} against a Zod schema shaped as
 * z.object({ body, params, query }). Only the keys present in the schema
 * are checked; parsed (coerced/defaulted) values are written back onto req.
 */
export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (parsed.body) req.body = parsed.body;
        if (parsed.params) req.params = parsed.params;
        if (parsed.query) req.query = parsed.query;

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            const details = err.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            }));
            return next(ApiError.badRequest('Validation failed', details));
        }
        return next(err);
    }
};

export default validate;