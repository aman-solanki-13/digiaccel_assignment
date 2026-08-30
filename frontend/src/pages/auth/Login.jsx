import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

const schema = z.object({
    email: z.string().trim().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

export function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        setServerError('');
        try {
            const user = await login(data);
            const redirectTo = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/');
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setServerError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center gap-2 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
                        <GraduationCap size={22} />
                    </div>
                    <h1 className="font-display text-xl font-bold text-ink-900">Welcome back</h1>
                    <p className="text-sm text-ink-500">Sign in to continue learning</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                    {serverError && (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                        error={errors.email?.message}
                        {...register('email')}
                    />
                    <Input
                        label="Password"
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Sign in
                    </Button>
                </form>

                <p className="mt-5 text-center text-sm text-ink-500">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
                        Create one
                    </Link>
                </p>

                <div className="mt-6 rounded-xl border border-dashed border-ink-200 bg-white/60 p-3 text-center text-xs text-ink-400">
                    Demo: admin@example.com / learner1@example.com — password123
                </div>
            </div>
        </div>
    );
}