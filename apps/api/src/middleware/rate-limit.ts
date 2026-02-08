import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

/**
 * Key generator that uses userId for authenticated requests,
 * falling back to IP for unauthenticated ones.
 */
function userOrIpKey(req: Request): string {
  return req.userId || req.ip || 'unknown';
}

/** General API rate limiter: 100 requests per 15 minutes per user/IP. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: userOrIpKey,
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
  windowMs: 15 * 60 * 1000,
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

/** PDF generation rate limiter: 10 requests per 15 minutes per user/IP. */
export const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: userOrIpKey,
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
