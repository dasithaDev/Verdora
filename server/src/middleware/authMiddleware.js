import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

/**
 * Helper to generate a signed JWT token.
 * @param {string} id - User ObjectId
 * @param {string} role - User role ('customer' | 'admin')
 * @returns {string} Signed JWT
 */
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Helper to configure secure httpOnly cookie options.
 */
export const cookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Authentication guard middleware: Verifies JWT from cookie or Bearer header.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. Fall back to Authorization header (Bearer token)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(
      res,
      401,
      'UNAUTHORIZED',
      'Authentication required. Please log in to access this resource.',
      []
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return sendError(
        res,
        401,
        'USER_NOT_FOUND',
        'The account associated with this session no longer exists.',
        []
      );
    }

    req.user = user;
    next();
  } catch (error) {
    // Do not include error.message in the response — it leaks JWT library internals
    // (e.g. "jwt malformed", "invalid signature") to the client.
    return sendError(
      res,
      401,
      'TOKEN_INVALID',
      'Session token is invalid or has expired. Please log in again.'
    );
  }
};

/**
 * Optional authentication middleware — attaches req.user if a valid JWT is present,
 * but does NOT reject the request if no token is provided. Used on public routes
 * that behave differently for authenticated admins (e.g. includeUnavailable menu items).
 */
export const optionalProtect = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user) req.user = user;
  } catch {
    // Invalid/expired token — treat as unauthenticated guest
  }
  next();
};

/**
 * Role-Based Access Control (RBAC) guard.
 * @param {...string} allowedRoles - Permitted roles (e.g. 'admin')
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        401,
        'UNAUTHORIZED',
        'Authentication required before role verification.'
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}].`,
        [{ userRole: req.user.role }]
      );
    }

    next();
  };
};
