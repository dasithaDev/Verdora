import rateLimit from 'express-rate-limit';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_SECONDS = WINDOW_MS / 1000; // 900 seconds

/**
 * Custom error handler for rate limit violations.
 * Uses the known window duration as retryAfter — res.getHeader('Retry-After') is only
 * populated with draft-7 standardHeaders mode; with draft-6 (standardHeaders: true)
 * it is not set, so reading it would always return null.
 */
const rateLimitHandler = (req, res) => {
  return res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this client. Please slow down and try again later.',
      details: [{ retryAfterSeconds: WINDOW_SECONDS }],
    },
  });
};

/**
 * Strict limiter for sensitive authentication endpoints (Login / Register).
 * Max 20 attempts per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * General limiter for public & API requests.
 * Max 300 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
