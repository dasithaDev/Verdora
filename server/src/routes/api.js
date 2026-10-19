import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import menuRoutes from './menuRoutes.js';
import orderRoutes from './orderRoutes.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../controllers/orderController.js';

const apiRouter = Router();

// Mount sub-routes
apiRouter.use(healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/menu', menuRoutes);
apiRouter.use('/orders', orderRoutes);

// Direct /admin/orders aliases per specification
apiRouter.get('/admin/orders', protect, requireRole('admin', 'staff'), validatePagination, getAllOrdersAdmin);
apiRouter.patch('/admin/orders/:id/status', protect, requireRole('admin', 'staff'), validateObjectId('id'), updateOrderStatusAdmin);

export default apiRouter;
