import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import apiRouter from './routes/api.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// 1. Security HTTP headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

// 3. Request Logging — registered early so ALL responses (including 429s) are captured
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Body & Cookie Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// 5. Request Sanitization (NoSQL injection guard on body and query only — params are populated per-route)
app.use(sanitizeInput);

// 6. General Rate Limiter on API routes
app.use('/api', apiLimiter);

// 7. API v1 Router Mount
app.use('/api/v1', apiRouter);

// 8. 404 Handler for Unmatched Routes
app.use(notFoundHandler);

// 9. Central Error Handler
app.use(errorHandler);

export default app;
