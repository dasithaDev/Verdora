import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';

const router = Router();

// All order endpoints require authentication
router.use(protect);

// Customer endpoints
router.post('/', createOrder);
router.get('/my', validatePagination, getMyOrders);
router.get('/:id', validateObjectId('id'), getOrderById);
router.patch('/:id/cancel', validateObjectId('id'), cancelOrder);

// Admin management routes are mounted directly on /admin/orders in api.js
// to avoid the /:id shadow conflict that would occur if defined here.

export default router;
