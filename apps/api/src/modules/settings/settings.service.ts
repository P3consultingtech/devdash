import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import type {
  UpdateBusinessProfileInput,
  UpdateUserSettingsInput,
  UpdateProfileInput,
  AuditLogQuery,
} from '@devdash/shared';
import type { Prisma } from '@prisma/client';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, locale: true },
  });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      ...(input.locale && { locale: input.locale }),
    },
    select: { id: true, email: true, firstName: true, lastName: true, locale: true },
  });
}

export async function getBusinessProfile(userId: string) {
  let bp = await prisma.businessProfile.findUnique({ where: { userId } });
  if (!bp) {
    bp = await prisma.businessProfile.create({
      data: { userId, businessName: '' },
    });
  }
  return bp;
}

export async function updateBusinessProfile(userId: string, input: UpdateBusinessProfileInput) {
  return prisma.businessProfile.upsert({
    where: { userId },
    update: {
      businessName: input.businessName,
      partitaIva: input.partitaIva || null,
      codiceFiscale: input.codiceFiscale || null,
      codiceDestinatario: input.codiceDestinatario || null,
      pec: input.pec || null,
      regimeFiscale: input.regimeFiscale || null,
      street: input.street || null,
      city: input.city || null,
      province: input.province || null,
      postalCode: input.postalCode || null,
      country: input.country,
      phone: input.phone || null,
      email: input.email || null,
      iban: input.iban || null,
    },
    create: {
      userId,
      businessName: input.businessName,
      partitaIva: input.partitaIva || null,
      codiceFiscale: input.codiceFiscale || null,
      codiceDestinatario: input.codiceDestinatario || null,
      pec: input.pec || null,
      regimeFiscale: input.regimeFiscale || null,
      street: input.street || null,
      city: input.city || null,
      province: input.province || null,
      postalCode: input.postalCode || null,
      country: input.country,
      phone: input.phone || null,
      email: input.email || null,
      iban: input.iban || null,
    },
  });
}

export async function updateLogoUrl(userId: string, logoUrl: string | null) {
  return prisma.businessProfile.upsert({
    where: { userId },
    update: { logoUrl },
    create: { userId, businessName: '', logoUrl },
  });
}

export async function getSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await prisma.userSettings.create({ data: { userId } });
  }
  return settings;
}

export async function updateSettings(userId: string, input: UpdateUserSettingsInput) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: { ...input },
    create: { userId, ...input },
  });
}

export async function getAuditLogs(userId: string, query: AuditLogQuery) {
  const { page, limit, action, entity, entityId } = query;
  const where: Prisma.AuditLogWhereInput = {
    userId,
    ...(action && { action }),
    ...(entity && { entity }),
    ...(entityId && { entityId }),
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
