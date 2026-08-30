import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';

const schema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'learner']),
});

export function Register() {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'learner' } });

    const onSubmit = async (data) => {
        setServerError('');
        try {
            const user = await registerUser(data);
            navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
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
                    <h1 className="font-display text-xl font-bold text-ink-900">Create your account</h1>
                    <p className="text-sm text-ink-500">Start building or taking video courses</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                    {serverError && (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>
                    )}

                    <Input label="Full name" id="name" placeholder="Ava Admin" error={errors.name?.message} {...register('name')} />
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
                        placeholder="At least 6 characters"
                        error={errors.password?.message}
                        {...register('password')}
                    />
                    <Select label="I am a..." id="role" error={errors.role?.message} {...register('role')}>
                        <option value="learner">Learner</option>
                        <option value="admin">Admin</option>
                    </Select>

                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Create account
                    </Button>
                </form>

                <p className="mt-5 text-center text-sm text-ink-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}