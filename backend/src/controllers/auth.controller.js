import * as authService from '../services/auth.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const register = catchAsync(async (req, res) => {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ success: true, data: { user, token } });
});

export const login = catchAsync(async (req, res) => {
    const { user, token } = await authService.login(req.body);
    res.status(200).json({ success: true, data: { user, token } });
});

export const getMe = catchAsync(async (req, res) => {
    const user = await authService.getMe(req.user._id);
    res.status(200).json({ success: true, data: { user } });
});