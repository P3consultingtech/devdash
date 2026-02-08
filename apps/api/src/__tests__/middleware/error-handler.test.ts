import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, errorHandler } from '../../middleware/error-handler';

// Mock the logger to prevent console output during tests
vi.mock('../../config/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Helper to create mock Express res with chainable methods
function createMockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json, _jsonData: () => json.mock.calls[0]?.[0] };
}

function createMockReq() {
  return {} as any;
}

function createMockNext() {
  return vi.fn() as any;
}

describe('Error Handler', () => {
  describe('AppError class', () => {
    it('should create an AppError with statusCode, code, and message', () => {
      const err = new AppError(404, 'NOT_FOUND', 'Resource not found');
      expect(err).toBeInstanceOf(AppError);
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
      expect(err.message).toBe('Resource not found');
      expect(err.name).toBe('AppError');
    });

    it('should create an AppError with details', () => {
      const details = { email: ['Invalid email format'] };
      const err = new AppError(400, 'VALIDATION_ERROR', 'Invalid input', details);
      expect(err.details).toEqual(details);
    });

    it('should create an AppError without details', () => {
      const err = new AppError(500, 'INTERNAL', 'Server error');
      expect(err.details).toBeUndefined();
    });

    it('should have a proper stack trace', () => {
      const err = new AppError(400, 'BAD_REQUEST', 'Bad request');
      expect(err.stack).toBeDefined();
      expect(err.stack).toContain('AppError');
    });
  });

  describe('errorHandler middleware', () => {
    it('should respond with AppError status code and structured error body', () => {
      const err = new AppError(404, 'NOT_FOUND', 'User not found');
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status(404).json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    });

    it('should include details in the error response when present', () => {
      const details = { name: ['Required'], email: ['Invalid format'] };
      const err = new AppError(400, 'VALIDATION_ERROR', 'Invalid data', details);
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status(400).json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid data',
          details,
        },
      });
    });

    it('should not include details key when AppError has no details', () => {
      const err = new AppError(403, 'FORBIDDEN', 'Access denied');
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res as any, next);

      const jsonCall = res.status(403).json.mock.calls[0][0];
      expect(jsonCall.error).not.toHaveProperty('details');
    });

    it('should respond with 500 and generic message for non-AppError errors', () => {
      const err = new Error('Database connection failed');
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res as any, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status(500).json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    });

    it('should log unhandled errors via logger.error using pino style', async () => {
      const { logger } = await import('../../config/logger');
      vi.mocked(logger.error).mockClear();

      const err = new Error('Something broke');
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res as any, next);

      // Pino-style: logger.error({ err }, 'Unhandled error')
      expect(logger.error).toHaveBeenCalledWith({ err }, 'Unhandled error');
    });

    it('should not log AppError instances to logger', async () => {
      const { logger } = await import('../../config/logger');
      vi.mocked(logger.error).mockClear();

      const err = new AppError(400, 'BAD_REQUEST', 'Bad input');
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(err, req, res as any, next);

      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle AppError with various status codes', () => {
      const testCases = [
        { statusCode: 400, code: 'BAD_REQUEST' },
        { statusCode: 401, code: 'UNAUTHORIZED' },
        { statusCode: 403, code: 'FORBIDDEN' },
        { statusCode: 404, code: 'NOT_FOUND' },
        { statusCode: 409, code: 'CONFLICT' },
        { statusCode: 422, code: 'UNPROCESSABLE' },
        { statusCode: 429, code: 'RATE_LIMITED' },
      ];

      for (const tc of testCases) {
        const err = new AppError(tc.statusCode, tc.code, `Error ${tc.code}`);
        const req = createMockReq();
        const res = createMockRes();
        const next = createMockNext();

        errorHandler(err, req, res as any, next);

        expect(res.status).toHaveBeenCalledWith(tc.statusCode);
      }
    });

    it('should handle errors without a stack trace', () => {
      const err = new Error('No stack');
      delete (err as any).stack;
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      // Should not throw
      expect(() => errorHandler(err, req, res as any, next)).not.toThrow();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
