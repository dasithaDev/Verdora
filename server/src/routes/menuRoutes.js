import { Router } from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, requireRole, optionalProtect } from '../middleware/authMiddleware.js';
import {
  validateObjectId,
  validatePagination,
  validateRequiredBody,
} from '../middleware/validate.js';

const router = Router();

// Public routes (optionalProtect allows admins to request includeUnavailable items)
router.get('/', optionalProtect, validatePagination, getMenuItems);
router.get('/:id', validateObjectId('id'), getMenuItemById);

// Admin-only management routes
router.post(
  '/',
  protect,
  requireRole('admin'),
  validateRequiredBody(['name', 'category', 'price']),
  createMenuItem
);

router.patch(
  '/:id',
  protect,
  requireRole('admin'),
  validateObjectId('id'),
  updateMenuItem
);

router.delete(
  '/:id',
  protect,
  requireRole('admin'),
  validateObjectId('id'),
  deleteMenuItem
);

export default router;
