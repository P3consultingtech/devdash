import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { getPaginationParams, buildPaginatedResponse } from '../../utils/pagination';
import type { CreateClientInput, ClientListQuery } from '@devdash/shared';
import { Prisma } from '@prisma/client';

export async function listClients(userId: string, query: ClientListQuery) {
  const { page, limit, search, type, sortBy, sortOrder } = query;
  const { skip, take } = getPaginationParams(page, limit);

  const where: Prisma.ClientWhereInput = {
    userId,
    isDeleted: false,
    ...(type && { type }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { partitaIva: { contains: search } },
      ],
    }),
  };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.client.count({ where }),
  ]);

  return buildPaginatedResponse(clients, total, page, limit);
}

export async function getClientById(userId: string, id: string) {
  const client = await prisma.client.findFirst({
    where: { id, userId, isDeleted: false },
    include: { invoices: { select: { id: true, number: true, status: true, netPayable: true, issueDate: true }, orderBy: { issueDate: 'desc' }, take: 10 } },
  });
  if (!client) throw new AppError(404, 'NOT_FOUND', 'Client not found');
  return client;
}

export async function createClient(userId: string, input: CreateClientInput) {
  return prisma.client.create({
    data: {
      userId,
      type: input.type,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      partitaIva: input.partitaIva || null,
      codiceFiscale: input.codiceFiscale || null,
      codiceDestinatario: input.codiceDestinatario || null,
      pec: input.pec || null,
      street: input.street || null,
      city: input.city || null,
      province: input.province || null,
      postalCode: input.postalCode || null,
      country: input.country,
      notes: input.notes || null,
    },
  });
}

export async function updateClient(userId: string, id: string, input: CreateClientInput) {
  const client = await prisma.client.findFirst({ where: { id, userId, isDeleted: false } });
  if (!client) throw new AppError(404, 'NOT_FOUND', 'Client not found');

  return prisma.client.update({
    where: { id },
    data: {
      type: input.type,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      partitaIva: input.partitaIva || null,
      codiceFiscale: input.codiceFiscale || null,
      codiceDestinatario: input.codiceDestinatario || null,
      pec: input.pec || null,
      street: input.street || null,
      city: input.city || null,
      province: input.province || null,
      postalCode: input.postalCode || null,
      country: input.country,
      notes: input.notes || null,
    },
  });
}

export async function exportClients(userId: string) {
  return prisma.client.findMany({
    where: { userId, isDeleted: false },
    orderBy: { name: 'asc' },
  });
}

export async function deleteClient(userId: string, id: string) {
  const client = await prisma.client.findFirst({ where: { id, userId, isDeleted: false } });
  if (!client) throw new AppError(404, 'NOT_FOUND', 'Client not found');

  await prisma.client.update({ where: { id }, data: { isDeleted: true } });
}
