import { Router } from 'express';
import { getDBStatus } from '../config/db.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'verdora-api',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbStatus.connected,
        status: dbStatus.connected ? 'healthy' : 'disconnected',
      },
    },
  });
});

export default router;
