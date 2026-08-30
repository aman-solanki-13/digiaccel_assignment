import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

import { LearnerDashboard } from '../pages/learner/LearnerDashboard';
import { VideoPlayerPage } from '../pages/learner/VideoPlayerPage';

import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { VideoManager } from '../pages/admin/VideoManager';
import { QuestionBuilder } from '../pages/admin/QuestionBuilder';
import { Reports } from '../pages/admin/Reports';
import { LearnerReportPage } from '../pages/admin/LearnerReportPage';

function RoleRedirect() {
    const { user } = useAuth();
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Learner */}
            <Route element={<ProtectedRoute allowedRoles={['learner']} />}>
                <Route path="/" element={<LearnerDashboard />} />
                <Route path="/videos/:videoId" element={<VideoPlayerPage />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/videos" element={<VideoManager />} />
                <Route path="/admin/videos/:videoId" element={<QuestionBuilder />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/reports/learners/:learnerId" element={<LearnerReportPage />} />
            </Route>

            <Route path="/redirect" element={<RoleRedirect />} />
            <Route path="*" element={<Navigate to="/redirect" replace />} />
        </Routes>
    );
}