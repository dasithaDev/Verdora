import mongoose from 'mongoose';
import { sendError } from '../utils/response.js';

/**
 * Validates that a route parameter is a valid 24-character hexadecimal MongoDB ObjectId.
 * @param {string} paramName - Parameter name (e.g., 'id')
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        `Invalid identifier format for '${paramName}'. Must be a 24-character hexadecimal ObjectId.`,
        [{ parameter: paramName, receivedValue: value }]
      );
    }
    next();
  };
};

/**
 * Validates and sanitizes pagination query parameters (page and limit).
 */
export const validatePagination = (req, res, next) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 12;
  if (limit > 50) limit = 50; // Cap maximum page size

  const skip = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    skip,
  };

  next();
};

/**
 * Validates that all required fields are present and non-empty in the request body.
 * @param {Array<string>} requiredFields
 */
export const validateRequiredBody = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        `Missing required fields in request payload: [${missing.join(', ')}]`,
        missing.map((f) => ({ field: f, message: `${f} is required` }))
      );
    }

    next();
  };
};
