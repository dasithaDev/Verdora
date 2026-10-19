import { Router } from 'express';
import { getDBStatus } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  return sendSuccess(res, 200, {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'verdora-api',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStatus.connected,
      status: dbStatus.connected ? 'healthy' : 'disconnected',
    },
  });
});

export default router;
