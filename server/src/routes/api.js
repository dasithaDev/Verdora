import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';

const apiRouter = Router();

// Mount sub-routes
apiRouter.use(healthRoutes);
apiRouter.use('/auth', authRoutes);

export default apiRouter;
