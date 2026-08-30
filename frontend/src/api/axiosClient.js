import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'vlp_token';

const axiosClient = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Unwrap { success, data } on the way out, and centralize 401 handling.
axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        const message =
            error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
        const details = error.response?.data?.details;
        return Promise.reject({ message, details, status: error.response?.status });
    },
);

export default axiosClient;
export { TOKEN_KEY };