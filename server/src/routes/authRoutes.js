import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRequiredBody } from '../middleware/validate.js';

const router = Router();

// Public auth endpoints (rate limited to 20 requests per 15 min window)
router.post('/register', authLimiter, validateRequiredBody(['name', 'email', 'password']), register);
router.post('/login', authLimiter, validateRequiredBody(['email', 'password']), login);

// Authenticated session endpoints
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
