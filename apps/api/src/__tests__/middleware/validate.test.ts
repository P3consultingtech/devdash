import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error-handler';

// Helper to create mock Express req/res/next objects
function createMocks(overrides: { body?: unknown; query?: unknown; params?: unknown } = {}) {
  const req = {
    body: overrides.body ?? {},
    query: overrides.query ?? {},
    params: overrides.params ?? {},
  } as any;

  const res = {} as any;

  const next = vi.fn();

  return { req, res, next };
}

describe('Validate Middleware', () => {
  const testSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
  });

  describe('body validation (default source)', () => {
    it('should call next() when body data is valid', () => {
      const { req, res, next } = createMocks({
        body: { name: 'Alice', email: 'alice@example.com' },
      });

      const middleware = validate(testSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // called without error
    });

    it('should replace req.body with parsed (coerced) data', () => {
      const schema = z.object({
        count: z.coerce.number(),
      });
      const { req, res, next } = createMocks({
        body: { count: '42' },
      });

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(req.body.count).toBe(42); // coerced to number
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should strip unknown properties via Zod strict or passthrough behavior', () => {
      const schema = z.object({
        name: z.string(),
      });
      const { req, res, next } = createMocks({
        body: { name: 'Alice', extra: 'field' },
      });

      const middleware = validate(schema);
      middleware(req, res, next);

      // Default Zod behavior strips unknown keys
      expect(req.body).toEqual({ name: 'Alice' });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError with 400 status for invalid body data', () => {
      const { req, res, next } = createMocks({
        body: { name: '', email: 'not-an-email' },
      });

      const middleware = validate(testSchema);

      expect(() => middleware(req, res, next)).toThrow(AppError);
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw AppError with VALIDATION_ERROR code', () => {
      const { req, res, next } = createMocks({
        body: { name: '', email: 'bad' },
      });

      const middleware = validate(testSchema);

      try {
        middleware(req, res, next);
        // Should not reach here
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.statusCode).toBe(400);
        expect(appErr.code).toBe('VALIDATION_ERROR');
        expect(appErr.message).toBe('Invalid request data');
      }
    });

    it('should include field-level error details in the AppError', () => {
      const { req, res, next } = createMocks({
        body: { name: '', email: 'invalid' },
      });

      const middleware = validate(testSchema);

      try {
        middleware(req, res, next);
        expect.unreachable('Should have thrown');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.details).toBeDefined();
        // 'name' field should have error about min length
        expect(appErr.details!['name']).toBeDefined();
        expect(appErr.details!['name'].length).toBeGreaterThan(0);
        // 'email' field should have error about invalid email
        expect(appErr.details!['email']).toBeDefined();
        expect(appErr.details!['email'].length).toBeGreaterThan(0);
      }
    });

    it('should throw AppError when required fields are missing', () => {
      const { req, res, next } = createMocks({
        body: {},
      });

      const middleware = validate(testSchema);

      expect(() => middleware(req, res, next)).toThrow(AppError);
    });
  });

  describe('query validation', () => {
    it('should validate req.query when source is "query"', () => {
      const querySchema = z.object({
        page: z.string(),
        limit: z.string(),
      });
      const { req, res, next } = createMocks({
        query: { page: '1', limit: '10' },
      });

      const middleware = validate(querySchema, 'query');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.query).toEqual({ page: '1', limit: '10' });
    });

    it('should throw AppError for invalid query params', () => {
      const querySchema = z.object({
        page: z.string().min(1),
      });
      const { req, res, next } = createMocks({
        query: {},
      });

      const middleware = validate(querySchema, 'query');

      expect(() => middleware(req, res, next)).toThrow(AppError);
    });
  });

  describe('params validation', () => {
    it('should validate req.params when source is "params"', () => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });
      const { req, res, next } = createMocks({
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });

      const middleware = validate(paramsSchema, 'params');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError for invalid params', () => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });
      const { req, res, next } = createMocks({
        params: { id: 'not-a-uuid' },
      });

      const middleware = validate(paramsSchema, 'params');

      expect(() => middleware(req, res, next)).toThrow(AppError);
    });
  });

  describe('non-Zod errors', () => {
    it('should re-throw non-ZodError exceptions as-is', () => {
      // Create a schema whose parse method throws a non-Zod error
      const badSchema = {
        parse: () => {
          throw new Error('Something unexpected');
        },
      } as any;

      const { req, res, next } = createMocks({ body: {} });
      const middleware = validate(badSchema);

      expect(() => middleware(req, res, next)).toThrow('Something unexpected');
      expect(next).not.toHaveBeenCalled();
    });
  });
});
