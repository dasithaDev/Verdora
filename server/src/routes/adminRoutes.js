import express from 'express';
import {
  getDashboardStats,
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
} from '../controllers/adminController.js';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from '../controllers/tableController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

// All admin dashboard routes require authenticated admin
router.use(protect, requireRole('admin'));

router.get('/stats', getDashboardStats);

// Table Floor Management Routes
router.get('/tables', getTables);
router.post('/tables', createTable);
router.patch('/tables/:id', validateObjectId('id'), updateTable);
router.delete('/tables/:id', validateObjectId('id'), deleteTable);

// Employee / Staff / User Management Routes
router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.delete('/users/:id', validateObjectId('id'), deleteAdminUser);

export default router;
