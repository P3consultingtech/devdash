import { z } from 'zod';

export const auditActionEnum = z.enum([
  'CREATE',
  'UPDATE',
  'DELETE',
  'STATUS_CHANGE',
  'LOGIN',
  'LOGIN_FAILED',
  'LOGOUT',
]);

export type AuditAction = z.infer<typeof auditActionEnum>;

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  action: auditActionEnum.optional(),
  entity: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
});

export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
