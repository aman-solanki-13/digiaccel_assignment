import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import { env, corsOrigin, rateLimitConfig } from './config/env.js';
import { uploadsDir } from './utils/paths.js';

const app = express();

// crossOriginResourcePolicy relaxed to 'cross-origin': the frontend (5173)
// and API/static uploads (4000) are different origins in dev, and helmet's
// default same-origin policy would block <video>/<img> from loading assets
// served from /uploads otherwise.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(compression());

if (env !== 'test') {
    app.use(morgan(env === 'development' ? 'dev' : 'combined'));
}

const limiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Video Learning + Interactive Quiz Builder API',
            version: '1.0.0',
            description: 'REST API for the video learning platform assessment',
        },
        servers: [{ url: '/api' }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['admin', 'learner'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                user: { $ref: '#/components/schemas/User' },
                                token: { type: 'string' },
                            },
                        },
                    },
                },
                Video: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        thumbnail: { type: 'string' },
                        videoUrl: { type: 'string' },
                        durationSeconds: { type: 'number' },
                        published: { type: 'boolean' },
                        createdBy: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                VideoInput: {
                    type: 'object',
                    required: ['title', 'videoUrl'],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        thumbnail: { type: 'string' },
                        videoUrl: { type: 'string' },
                        durationSeconds: { type: 'number' },
                    },
                },
                QuestionOption: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'a' },
                        text: { type: 'string' },
                    },
                },
                Question: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        video: { type: 'string' },
                        timestamp: { type: 'number', description: 'Seconds into the video' },
                        type: { type: 'string', enum: ['single_choice', 'multiple_choice', 'short_answer'] },
                        text: { type: 'string' },
                        options: { type: 'array', items: { $ref: '#/components/schemas/QuestionOption' } },
                        correctAnswer: {
                            oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
                        },
                    },
                },
                QuestionInput: {
                    type: 'object',
                    required: ['timestamp', 'type', 'text', 'correctAnswer'],
                    properties: {
                        timestamp: { type: 'number' },
                        type: { type: 'string', enum: ['single_choice', 'multiple_choice', 'short_answer'] },
                        text: { type: 'string' },
                        options: { type: 'array', items: { $ref: '#/components/schemas/QuestionOption' } },
                        correctAnswer: {
                            oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
                        },
                    },
                },
                Assignment: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        video: { type: 'object' },
                        learner: { type: 'object' },
                        assignedBy: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Progress: {
                    type: 'object',
                    properties: {
                        video: { type: 'string' },
                        learner: { type: 'string' },
                        lastWatchedTimestamp: { type: 'number' },
                        completionPercentage: { type: 'number' },
                        completed: { type: 'boolean' },
                        completedAt: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                ProgressInput: {
                    type: 'object',
                    required: ['lastWatchedTimestamp', 'completionPercentage'],
                    properties: {
                        lastWatchedTimestamp: { type: 'number' },
                        completionPercentage: { type: 'number', minimum: 0, maximum: 100 },
                        completed: { type: 'boolean' },
                    },
                },
                Response: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        learner: { type: 'string' },
                        video: { type: 'string' },
                        question: { type: 'string' },
                        answer: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                        isCorrect: { type: 'boolean' },
                        answeredAt: { type: 'string', format: 'date-time' },
                    },
                },
                ApiError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        details: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

// static file serving for uploaded video/thumbnail assets
app.use('/uploads', express.static(uploadsDir));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;