import app from './app.js';
import { connectDB } from './config/db.js';
import { port } from './config/env.js';

async function startServer() {
    await connectDB();

    const server = app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`[server] Listening on http://localhost:${port}`);
        // eslint-disable-next-line no-console
        console.log(`[server] API docs at http://localhost:${port}/api-docs`);
    });

    process.on('unhandledRejection', (err) => {
        // eslint-disable-next-line no-console
        console.error('[server] Unhandled rejection, shutting down:', err);
        server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
        // eslint-disable-next-line no-console
        console.log('[server] SIGTERM received, shutting down gracefully');
        server.close(() => process.exit(0));
    });
}

startServer();