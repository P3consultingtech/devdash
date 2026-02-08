import 'dotenv/config';
import express from 'express';
import path from 'path';
import { env } from './config/env';
import { logger } from './config/logger';
import { corsMiddleware } from './middleware/cors';
import { apiLimiter } from './middleware/rate-limit';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './modules/auth/auth.routes';
import clientsRoutes from './modules/clients/clients.routes';
import invoicesRoutes from './modules/invoices/invoices.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import settingsRoutes from './modules/settings/settings.routes';
import { markOverdueInvoices } from './modules/invoices/invoices.service';

const app = express();

// Global middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/invoices', invoicesRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.API_PORT, () => {
  logger.info(`API server running on port ${env.API_PORT}`);

  // Check for overdue invoices every hour
  setInterval(async () => {
    try {
      const count = await markOverdueInvoices();
      if (count > 0) logger.info(`Marked ${count} invoices as overdue`);
    } catch (err) {
      logger.error('Failed to mark overdue invoices', err);
    }
  }, 60 * 60 * 1000);
});

export default app;
