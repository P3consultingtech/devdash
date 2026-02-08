import { prisma } from '../../config/database';

export async function getSummary(userId: string, year: number) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const [paidAgg, sentAgg, overdueAgg, totalClients, totalInvoices, paidCount] = await Promise.all([
    prisma.invoice.aggregate({
      where: { userId, status: 'PAID', issueDate: { gte: yearStart, lt: yearEnd } },
      _sum: { netPayable: true },
    }),
    prisma.invoice.aggregate({
      where: { userId, status: 'SENT', issueDate: { gte: yearStart, lt: yearEnd } },
      _sum: { netPayable: true },
    }),
    prisma.invoice.aggregate({
      where: { userId, status: 'OVERDUE', issueDate: { gte: yearStart, lt: yearEnd } },
      _sum: { netPayable: true },
    }),
    prisma.client.count({ where: { userId, isDeleted: false } }),
    prisma.invoice.count({ where: { userId, issueDate: { gte: yearStart, lt: yearEnd } } }),
    prisma.invoice.count({ where: { userId, status: 'PAID', issueDate: { gte: yearStart, lt: yearEnd } } }),
  ]);

  return {
    totalRevenue: paidAgg._sum.netPayable ?? 0,
    outstandingAmount: sentAgg._sum.netPayable ?? 0,
    overdueAmount: overdueAgg._sum.netPayable ?? 0,
    totalClients,
    totalInvoices,
    paidInvoices: paidCount,
  };
}

export async function getMonthlyRevenue(userId: string, year: number) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const invoices = await prisma.invoice.findMany({
    where: { userId, status: 'PAID', issueDate: { gte: yearStart, lt: yearEnd } },
    select: { issueDate: true, netPayable: true },
  });

  const monthlyMap = new Map<number, { revenue: number; count: number }>();
  for (let m = 0; m < 12; m++) {
    monthlyMap.set(m, { revenue: 0, count: 0 });
  }

  for (const inv of invoices) {
    const month = new Date(inv.issueDate).getMonth();
    const entry = monthlyMap.get(month)!;
    entry.revenue += inv.netPayable;
    entry.count += 1;
  }

  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month: month + 1,
    year,
    revenue: data.revenue,
    count: data.count,
  }));
}

export async function getInvoicesByStatus(userId: string, year: number) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const results = await prisma.invoice.groupBy({
    by: ['status'],
    where: { userId, issueDate: { gte: yearStart, lt: yearEnd } },
    _count: true,
    _sum: { netPayable: true },
  });

  return results.map((r) => ({
    status: r.status,
    count: r._count,
    amount: r._sum.netPayable ?? 0,
  }));
}

export async function getTopClients(userId: string, year: number) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const results = await prisma.invoice.groupBy({
    by: ['clientId'],
    where: { userId, status: 'PAID', issueDate: { gte: yearStart, lt: yearEnd } },
    _sum: { netPayable: true },
    _count: true,
    orderBy: { _sum: { netPayable: 'desc' } },
    take: 5,
  });

  const clientIds = results.map((r) => r.clientId);
  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true },
  });

  const clientMap = new Map(clients.map((c) => [c.id, c.name]));

  return results.map((r) => ({
    clientId: r.clientId,
    clientName: clientMap.get(r.clientId) ?? 'Unknown',
    totalRevenue: r._sum.netPayable ?? 0,
    invoiceCount: r._count,
  }));
}

export async function getRecentActivity(userId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: { client: { select: { name: true } } },
  });

  return invoices.map((inv) => ({
    id: inv.id,
    type: inv.status === 'PAID' ? 'invoice_paid' : inv.status === 'SENT' ? 'invoice_sent' : 'invoice_created',
    description: `${inv.number} - ${inv.client.name}`,
    createdAt: inv.updatedAt.toISOString(),
  }));
}
