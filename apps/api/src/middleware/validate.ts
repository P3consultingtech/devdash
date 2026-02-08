import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error-handler';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, source: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of err.issues) {
          const path = issue.path.join('.');
          if (!details[path]) details[path] = [];
          details[path].push(issue.message);
        }
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', details);
      }
      throw err;
    }
  };
}
