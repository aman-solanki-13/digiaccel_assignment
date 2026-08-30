export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export function formatTimestamp(totalSeconds = 0) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('');
}

// The API base is .../api, but uploaded files are served from the API
// origin's root (/uploads/...), not under /api. This derives that origin
// once and resolves a stored path (or a full external URL) into something
// an <img>/<video> tag can load directly.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function resolveMediaUrl(pathOrUrl) {
    if (!pathOrUrl) return '';
    if (/^https?:\/\//.test(pathOrUrl) || pathOrUrl.startsWith('blob:')) return pathOrUrl;
    return `${API_ORIGIN}${pathOrUrl}`;
}