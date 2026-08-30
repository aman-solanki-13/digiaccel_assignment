import { NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, Video, Users, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../lib/utils';
import { cn } from '../../lib/utils';

const adminLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/videos', label: 'Videos', icon: Video },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

const learnerLinks = [{ to: '/', label: 'My Videos', icon: Video, end: true }];

export function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const links = user?.role === 'admin' ? adminLinks : learnerLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-ink-50">
            <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                                <GraduationCap size={18} />
                            </div>
                            <span className="font-display text-base font-bold text-ink-900">LearnFlow</span>
                        </div>

                        <nav className="hidden items-center gap-1 sm:flex">
                            {links.map(({ to, label, icon: Icon, end }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                                        )
                                    }
                                >
                                    <Icon size={16} />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium leading-tight text-ink-900">{user?.name}</p>
                            <p className="text-xs capitalize leading-tight text-ink-400">{user?.role}</p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                            {initials(user?.name)}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                            aria-label="Log out"
                            title="Log out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* mobile nav */}
                <nav className="flex items-center gap-1 overflow-x-auto border-t border-ink-100 px-4 py-2 sm:hidden">
                    {links.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                cn(
                                    'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600',
                                )
                            }
                        >
                            <Icon size={14} />
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        </div>
    );
}