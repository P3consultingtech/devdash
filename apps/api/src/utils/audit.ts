import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { AuditAction, Prisma } from '@prisma/client';

interface AuditEntry {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string | string[];
}

/**
 * Records an audit log entry. Runs asynchronously and never throws
 * to avoid disrupting the main request flow.
 */
export function audit(entry: AuditEntry): void {
  const ip = Array.isArray(entry.ipAddress) ? entry.ipAddress[0] : entry.ipAddress;
  prisma.auditLog
    .create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        details: entry.details ?? undefined,
        ipAddress: ip,
      },
    })
    .catch((err: unknown) => {
      logger.error({ err, entry }, 'Failed to write audit log');
    });
}
