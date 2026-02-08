import { type Request, type Response, type NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../config/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  const start = process.hrtime.bigint();

  // Attach request ID to the response header
  res.setHeader('X-Request-ID', requestId);

  // Log when the response finishes
  res.on('finish', () => {
    const durationNs = process.hrtime.bigint() - start;
    const durationMs = Number(durationNs) / 1_000_000;

    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Math.round(durationMs * 100) / 100,
      contentLength: res.getHeader('content-length'),
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'request completed with server error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'request completed with client error');
    } else {
      logger.info(logData, 'request completed');
    }
  });

  next();
}
