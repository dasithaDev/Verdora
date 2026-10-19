import User from '../models/User.js';
import { generateToken, cookieOptions } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/response.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new customer account.
 * Route: POST /api/v1/auth/register
 * Access: Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic field validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'Name is required and must be at least 2 characters long.',
        [{ field: 'name' }]
      );
    }

    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'A valid email address is required.',
        [{ field: 'email' }]
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'Password must be at least 8 characters long.',
        [{ field: 'password' }]
      );
    }

    // 2. Check for duplicate email
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(
        res,
        409,
        'CONFLICT',
        'An account with this email address already exists.',
        [{ field: 'email', value: normalizedEmail }]
      );
    }

    // 3. Prevent role escalation — public registration CANNOT create admin
    const role = 'customer';

    // 4. Hash password and persist user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
    });

    // 5. Generate session token & set httpOnly cookie
    const token = generateToken(user._id, user.role);
    res.cookie('jwt', token, cookieOptions);

    return sendSuccess(res, 201, {
      message: 'Account registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate customer or admin with email and password.
 * Route: POST /api/v1/auth/login
 * Access: Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'Both email and password are required.',
        []
      );
    }

    // 1. Fetch user by normalized email
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // 2. Generic authentication failure to prevent username enumeration
    if (!user || !(await user.matchPassword(password))) {
      return sendError(
        res,
        401,
        'UNAUTHORIZED',
        'Invalid email or password.',
        []
      );
    }

    // 3. Issue session token & set httpOnly cookie
    const token = generateToken(user._id, user.role);
    res.cookie('jwt', token, cookieOptions);

    return sendSuccess(res, 200, {
      message: 'Authentication successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * End session and clear authentication cookie.
 * Route: POST /api/v1/auth/logout
 * Access: Authenticated
 */
export const logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return sendSuccess(res, 200, {
    message: 'Logged out successfully.',
  });
};

/**
 * Retrieve current authenticated user profile.
 * Route: GET /api/v1/auth/me
 * Access: Authenticated
 */
export const getMe = (req, res) => {
  // req.user is attached by protect middleware and has passwordHash excluded
  return sendSuccess(res, 200, {
    user: req.user.toJSON ? req.user.toJSON() : req.user,
  });
};
