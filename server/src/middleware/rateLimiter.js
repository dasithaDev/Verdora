import rateLimit from 'express-rate-limit';

/**
 * Custom error handler for rate limit violations.
 */
const rateLimitHandler = (req, res) => {
  return res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this client. Please slow down and try again later.',
      details: [
        {
          ip: req.ip,
          retryAfter: res.getHeader('Retry-After') || 900,
        },
      ],
    },
  });
};

/**
 * Strict limiter for sensitive authentication endpoints (Login / Register).
 * Max 20 attempts per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
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
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
