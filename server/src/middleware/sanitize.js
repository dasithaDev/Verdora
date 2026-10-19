/**
 * Recursively cleanses an object by stripping keys containing MongoDB query operators (starting with '$' or containing '.')
 * @param {any} value
 * @returns {any} Sanitized value
 */
export const sanitizeValue = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      if (!key.startsWith('$') && !key.includes('.')) {
        cleaned[key] = sanitizeValue(value[key]);
      }
    }
    return cleaned;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  return value;
};

/**
 * Express middleware to sanitize req.body, req.query, and req.params against NoSQL injection.
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};
