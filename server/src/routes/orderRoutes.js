import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../controllers/orderController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';

const router = Router();

// All order endpoints require authentication
router.use(protect);

// Customer endpoints
router.post('/', createOrder);
router.get('/my', validatePagination, getMyOrders);
router.get('/:id', validateObjectId('id'), getOrderById);
router.patch('/:id/cancel', validateObjectId('id'), cancelOrder);

// Admin & Staff management endpoints
router.get('/admin/all', requireRole('admin', 'staff'), validatePagination, getAllOrdersAdmin);
router.patch('/admin/:id/status', requireRole('admin', 'staff'), validateObjectId('id'), updateOrderStatusAdmin);

export default router;
