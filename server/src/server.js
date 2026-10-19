import app from './app.js';
import { config, validateEnv } from './config/env.js';
import { connectDB, closeDB } from './config/db.js';

// Validate environment variables on startup
validateEnv();

// Attempt DB connection
connectDB();

const server = app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(` Verdora API Server running on port ${config.port}`);
  console.log(` Environment: ${config.env}`);
  console.log(` Health check: http://localhost:${config.port}/api/v1/health`);
  console.log(`=========================================`);
});

// Graceful shutdown handling
const handleShutdown = async (signal) => {
  console.log(`\n[Process] Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('[Process] HTTP server closed.');
    await closeDB();
    process.exit(0);
  });

  // Force shutdown after timeout if pending connections hang
  setTimeout(() => {
    console.error('[Process] Forcefully terminating after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
