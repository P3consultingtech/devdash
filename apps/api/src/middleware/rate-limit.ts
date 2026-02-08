import rateLimit from 'express-rate-limit';

/** General API rate limiter: 100 requests per 15 minutes per IP. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later' },
  },
});

/**
 * Strict auth rate limiter: 5 requests per 15 minutes per IP.
 * Applied to login and register endpoints to prevent brute-force attacks.
 */
export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many authentication attempts, please try again later',
    },
  },
});

/** General auth rate limiter for non-critical auth endpoints (refresh, me, logout). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many authentication attempts' },
  },
});

/** PDF generation rate limiter: 10 requests per 15 minutes per IP. */
export const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many PDF generation requests, please try again later',
    },
  },
});
