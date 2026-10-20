import User from '../models/User.js';
import { generateToken, cookieOptions } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emailRegex } from '../utils/validators.js';

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

    // 5. Generate session token & set httpOnly cookie only
    // Token is NOT included in the response body — it lives exclusively in the
    // httpOnly cookie so JavaScript cannot read it (XSS protection).
    const token = generateToken(user._id, user.role);
    res.cookie('jwt', token, cookieOptions);

    return sendSuccess(res, 201, {
      message: 'Account registered successfully',
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
    // Note: validateRequiredBody(['email','password']) already runs before this
    // controller, so both fields are guaranteed non-empty at this point.

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

    // 3. Issue session token & set httpOnly cookie only
    // Token is NOT returned in the response body — httpOnly cookie only (XSS protection).
    const token = generateToken(user._id, user.role);
    res.cookie('jwt', token, cookieOptions);

    return sendSuccess(res, 200, {
      message: 'Authentication successful',
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
  // Use the same cookie options (httpOnly, secure, sameSite) matching how the cookie was set,
  // omitting maxAge so Express expires the cookie immediately without deprecation warnings.
  const { maxAge, ...clearCookieOptions } = cookieOptions;
  res.clearCookie('jwt', clearCookieOptions);

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

/**
 * Update authenticated user's profile details or password.
 * Route: PATCH /api/v1/auth/profile
 * Access: Authenticated
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'User profile not found.');
    }

    if (name && typeof name === 'string') {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Name must be at least 2 characters long.', [{ field: 'name' }]);
      }
      user.name = trimmedName;
    }

    if (newPassword) {
      if (!currentPassword) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Current password is required to set a new password.', [{ field: 'currentPassword' }]);
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Incorrect current password.', [{ field: 'currentPassword' }]);
      }
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'New password must be at least 8 characters long.', [{ field: 'newPassword' }]);
      }
      user.passwordHash = await User.hashPassword(newPassword);
    }

    await user.save();

    return sendSuccess(res, 200, {
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
