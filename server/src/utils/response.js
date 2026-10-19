/**
 * Standardized API success responder.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {object} data
 */
export const sendSuccess = (res, statusCode = 200, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * Standardized API error responder.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} code
 * @param {string} message
 * @param {Array} details
 */
export const sendError = (res, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', message = 'An error occurred', details = []) => {
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};
