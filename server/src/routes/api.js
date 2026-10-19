import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import menuRoutes from './menuRoutes.js';

const apiRouter = Router();

// Mount sub-routes
apiRouter.use(healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/menu', menuRoutes);

export default apiRouter;
