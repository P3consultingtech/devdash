import 'dotenv/config';
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';
import { corsMiddleware } from './middleware/cors';
import { requestLogger } from './middleware/request-logger';
import { apiLimiter } from './middleware/rate-limit';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './modules/auth/auth.routes';
import clientsRoutes from './modules/clients/clients.routes';
import invoicesRoutes from './modules/invoices/invoices.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import settingsRoutes from './modules/settings/settings.routes';
import { markOverdueInvoices } from './modules/invoices/invoices.service';

const app = express();

// Security headers (must be first)
app.use(helmet());

// Global middleware
app.use(corsMiddleware);
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check endpoints (no auth required)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
    });
  }
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/invoices', invoicesRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Error handler (must be last)
app.use(errorHandler);

const server = app.listen(env.API_PORT, () => {
  logger.info({ port: env.API_PORT }, 'API server running');

  // Check for overdue invoices every hour
  setInterval(
    async () => {
      try {
        const count = await markOverdueInvoices();
        if (count > 0) logger.info({ count }, 'Marked invoices as overdue');
      } catch (err) {
        logger.error({ err }, 'Failed to mark overdue invoices');
      }
    },
    60 * 60 * 1000,
  );
});

// --- Graceful shutdown ---

function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Received shutdown signal. Starting graceful shutdown...');

  server.close(async () => {
    logger.info('HTTP server closed. No longer accepting connections.');

    try {
      await prisma.$disconnect();
      logger.info('Database connection closed.');
    } catch (err) {
      logger.error({ err }, 'Error disconnecting from database');
    }

    logger.info('Graceful shutdown complete.');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long (30 seconds)
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 30_000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
