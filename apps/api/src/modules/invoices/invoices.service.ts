import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { getPaginationParams, buildPaginatedResponse } from '../../utils/pagination';
import { calculateInvoice, formatInvoiceNumber } from '@devdash/shared';
import type { CreateInvoiceInput, InvoiceListQuery, InvoiceStatus } from '@devdash/shared';
import { type Prisma } from '@prisma/client';

export async function markOverdueInvoices(userId?: string) {
  const where: Prisma.InvoiceWhereInput = {
    status: 'SENT',
    dueDate: { lt: new Date() },
    ...(userId && { userId }),
  };
  const { count } = await prisma.invoice.updateMany({
    where,
    data: { status: 'OVERDUE' },
  });
  return count;
}

export async function listInvoices(userId: string, query: InvoiceListQuery) {
  // Mark overdue invoices before listing
  await markOverdueInvoices(userId);

  const { page, limit, status, clientId, search, fromDate, toDate, sortBy, sortOrder } = query;
  const { skip, take } = getPaginationParams(page, limit);

  const where: Prisma.InvoiceWhereInput = {
    userId,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(search && {
      OR: [
        { number: { contains: search, mode: 'insensitive' as const } },
        { client: { name: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
    ...(fromDate && { issueDate: { gte: new Date(fromDate) } }),
    ...(toDate && { issueDate: { lte: new Date(toDate) } }),
  };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { client: { select: { id: true, name: true } } },
    }),
    prisma.invoice.count({ where }),
  ]);

  return buildPaginatedResponse(invoices, total, page, limit);
}

export async function getInvoiceById(userId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      client: true,
      items: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!invoice) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
  return invoice;
}

export async function createInvoice(userId: string, input: CreateInvoiceInput) {
  const client = await prisma.client.findFirst({
    where: { id: input.clientId, userId, isDeleted: false },
  });
  if (!client) throw new AppError(404, 'NOT_FOUND', 'Client not found');

  const calc = calculateInvoice({
    items: input.items.map((i) => ({ quantity: i.quantity, unitPriceCents: i.unitPriceCents })),
    ivaRate: input.ivaRate,
    applyRitenuta: input.applyRitenuta,
    ritenutaRate: input.ritenutaRate,
    applyCassa: input.applyCassa,
    cassaRate: input.cassaRate,
    applyBollo: input.applyBollo,
  });

  const year = new Date(input.issueDate).getFullYear();

  // Atomic sequence number generation using a transaction
  const invoice = await prisma.$transaction(async (tx) => {
    const lastInvoice = await tx.invoice.findFirst({
      where: { userId, year },
      orderBy: { sequenceNumber: 'desc' },
      select: { sequenceNumber: true },
    });

    const sequenceNumber = (lastInvoice?.sequenceNumber ?? 0) + 1;
    const number = formatInvoiceNumber(sequenceNumber, year);

    return tx.invoice.create({
      data: {
        userId,
        clientId: input.clientId,
        number,
        year,
        sequenceNumber,
        issueDate: new Date(input.issueDate),
        dueDate: new Date(input.dueDate),
        ivaRate: input.ivaRate,
        applyRitenuta: input.applyRitenuta,
        ritenutaRate: input.ritenutaRate,
        applyCassa: input.applyCassa,
        cassaRate: input.cassaRate,
        applyBollo: input.applyBollo,
        subtotal: calc.subtotal,
        cassaAmount: calc.cassaAmount,
        taxableBase: calc.taxableBase,
        ivaAmount: calc.ivaAmount,
        bolloAmount: calc.bolloAmount,
        grossTotal: calc.grossTotal,
        ritenutaAmount: calc.ritenutaAmount,
        netPayable: calc.netPayable,
        notes: input.notes || null,
        paymentTerms: input.paymentTerms || null,
        items: {
          create: input.items.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            amount: Math.round(item.quantity * item.unitPriceCents),
            sortOrder: index,
          })),
        },
      },
      include: { client: true, items: { orderBy: { sortOrder: 'asc' } } },
    });
  });

  return invoice;
}

export async function updateInvoice(userId: string, id: string, input: CreateInvoiceInput) {
  const existing = await prisma.invoice.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
  if (existing.status !== 'DRAFT') {
    throw new AppError(400, 'INVALID_STATUS', 'Only draft invoices can be edited');
  }

  const calc = calculateInvoice({
    items: input.items.map((i) => ({ quantity: i.quantity, unitPriceCents: i.unitPriceCents })),
    ivaRate: input.ivaRate,
    applyRitenuta: input.applyRitenuta,
    ritenutaRate: input.ritenutaRate,
    applyCassa: input.applyCassa,
    cassaRate: input.cassaRate,
    applyBollo: input.applyBollo,
  });

  return prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

    return tx.invoice.update({
      where: { id },
      data: {
        clientId: input.clientId,
        issueDate: new Date(input.issueDate),
        dueDate: new Date(input.dueDate),
        ivaRate: input.ivaRate,
        applyRitenuta: input.applyRitenuta,
        ritenutaRate: input.ritenutaRate,
        applyCassa: input.applyCassa,
        cassaRate: input.cassaRate,
        applyBollo: input.applyBollo,
        subtotal: calc.subtotal,
        cassaAmount: calc.cassaAmount,
        taxableBase: calc.taxableBase,
        ivaAmount: calc.ivaAmount,
        bolloAmount: calc.bolloAmount,
        grossTotal: calc.grossTotal,
        ritenutaAmount: calc.ritenutaAmount,
        netPayable: calc.netPayable,
        notes: input.notes || null,
        paymentTerms: input.paymentTerms || null,
        items: {
          create: input.items.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            amount: Math.round(item.quantity * item.unitPriceCents),
            sortOrder: index,
          })),
        },
      },
      include: { client: true, items: { orderBy: { sortOrder: 'asc' } } },
    });
  });
}

export async function deleteInvoice(userId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
  if (!invoice) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
  if (invoice.status !== 'DRAFT') {
    throw new AppError(400, 'INVALID_STATUS', 'Only draft invoices can be deleted');
  }

  await prisma.invoice.delete({ where: { id } });
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['PAID', 'OVERDUE', 'CANCELLED'],
  OVERDUE: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: ['DRAFT'],
};

export async function updateInvoiceStatus(userId: string, id: string, newStatus: InvoiceStatus) {
  const invoice = await prisma.invoice.findFirst({ where: { id, userId } });
  if (!invoice) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');

  const allowed = VALID_TRANSITIONS[invoice.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      400,
      'INVALID_TRANSITION',
      `Cannot transition from ${invoice.status} to ${newStatus}`,
    );
  }

  const previousStatus = invoice.status;
  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: newStatus },
    include: { client: { select: { id: true, name: true } } },
  });

  return { ...updated, previousStatus };
}

export async function duplicateInvoice(userId: string, id: string) {
  const original = await prisma.invoice.findFirst({
    where: { id, userId },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!original) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');

  const today = new Date();
  const year = today.getFullYear();

  return prisma.$transaction(async (tx) => {
    const lastInvoice = await tx.invoice.findFirst({
      where: { userId, year },
      orderBy: { sequenceNumber: 'desc' },
      select: { sequenceNumber: true },
    });

    const sequenceNumber = (lastInvoice?.sequenceNumber ?? 0) + 1;
    const number = formatInvoiceNumber(sequenceNumber, year);

    return tx.invoice.create({
      data: {
        userId,
        clientId: original.clientId,
        number,
        year,
        sequenceNumber,
        status: 'DRAFT',
        issueDate: today,
        dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        ivaRate: original.ivaRate,
        applyRitenuta: original.applyRitenuta,
        ritenutaRate: original.ritenutaRate,
        applyCassa: original.applyCassa,
        cassaRate: original.cassaRate,
        applyBollo: original.applyBollo,
        subtotal: original.subtotal,
        cassaAmount: original.cassaAmount,
        taxableBase: original.taxableBase,
        ivaAmount: original.ivaAmount,
        bolloAmount: original.bolloAmount,
        grossTotal: original.grossTotal,
        ritenutaAmount: original.ritenutaAmount,
        netPayable: original.netPayable,
        notes: original.notes,
        paymentTerms: original.paymentTerms,
        items: {
          create: original.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            amount: item.amount,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: { client: true, items: { orderBy: { sortOrder: 'asc' } } },
    });
  });
}

export async function exportInvoices(userId: string) {
  return prisma.invoice.findMany({
    where: { userId },
    include: { client: { select: { name: true } } },
    orderBy: { issueDate: 'desc' },
  });
}

export async function getNextInvoiceNumber(userId: string) {
  const year = new Date().getFullYear();
  const last = await prisma.invoice.findFirst({
    where: { userId, year },
    orderBy: { sequenceNumber: 'desc' },
    select: { sequenceNumber: true },
  });
  const nextSequence = (last?.sequenceNumber ?? 0) + 1;
  return { number: formatInvoiceNumber(nextSequence, year), year, sequenceNumber: nextSequence };
}
