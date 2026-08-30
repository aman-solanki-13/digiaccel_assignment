import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { TOKEN_KEY } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            setIsLoading(false);
            return;
        }

        authApi
            .me()
            .then((res) => setUser(res.data.user))
            .catch(() => {
                localStorage.removeItem(TOKEN_KEY);
                queryClient.clear();
                setUser(null);
            })
            .finally(() => setIsLoading(false));
    }, [queryClient]);

    const login = useCallback(async (credentials) => {
        // Clear any data belonging to a previous session/user
        queryClient.clear();

        const res = await authApi.login(credentials);

        localStorage.setItem(TOKEN_KEY, res.data.token);
        setUser(res.data.user);

        return res.data.user;
    }, [queryClient]);

    const register = useCallback(async (payload) => {
        // Clear any existing cached authenticated data
        queryClient.clear();

        const res = await authApi.register(payload);

        localStorage.setItem(TOKEN_KEY, res.data.token);
        setUser(res.data.user);

        return res.data.user;
    }, [queryClient]);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);

        // Very important: remove cached data from the previous user
        queryClient.clear();

        setUser(null);
    }, [queryClient]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return ctx;
}
