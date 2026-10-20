import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin dashboard routes require authenticated admin
router.use(protect, requireRole('admin'));

router.get('/stats', getDashboardStats);

export default router;
