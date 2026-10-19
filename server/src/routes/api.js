import { Router } from 'express';
import healthRoutes from './healthRoutes.js';

const apiRouter = Router();

// Mount sub-routes
apiRouter.use(healthRoutes);

export default apiRouter;
