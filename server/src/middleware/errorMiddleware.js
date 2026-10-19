import { sendError } from '../utils/response.js';

/**
 * 404 Handler for unmatched routes.
 */
export const notFoundHandler = (req, res, next) => {
  return sendError(
    res,
    404,
    'NOT_FOUND',
    `Resource not found: Cannot ${req.method} ${req.originalUrl}`,
    []
  );
};

/**
 * Central Error Handler for operational and runtime exceptions.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Handle Mongoose CastError (e.g. malformed ObjectId)
  if (err.name === 'CastError') {
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      `Resource not found or malformed identifier for '${err.path}'`,
      [{ path: err.path, value: err.value }]
    );
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Validation failure on submitted data.',
      details
    );
  }

  // Handle Duplicate Key Error (MongoDB code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(
      res,
      409,
      'CONFLICT',
      `Duplicate entry detected for '${field}'. A record with this ${field} already exists.`,
      [{ field, duplicateValue: err.keyValue?.[field] }]
    );
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(
      res,
      401,
      'TOKEN_INVALID',
      'Invalid or expired authentication token. Please log in again.'
    );
  }

  // Generic fallback
  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server error occurred.',
      details: err.details || [],
      ...(isProd ? {} : { stack: err.stack }),
    },
  });
};
