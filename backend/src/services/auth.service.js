import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

export async function register({ name, email, password, role }) {
    const existing = await User.findOne({ email });
    if (existing) {
        throw ApiError.conflict('An account with this email already exists');
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken({ sub: user._id.toString(), role: user.role });

    user.password = undefined;
    return { user, token };
}

export async function login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signToken({ sub: user._id.toString(), role: user.role });
    user.password = undefined;

    return { user, token };
}

export async function getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
        throw ApiError.notFound('User not found');
    }
    return user;
}