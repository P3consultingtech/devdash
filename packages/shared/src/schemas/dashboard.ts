import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

export interface DashboardSummary {
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  totalClients: number;
  totalInvoices: number;
  paidInvoices: number;
}

export interface MonthlyRevenue {
  month: number;
  year: number;
  revenue: number;
  count: number;
}

export interface InvoicesByStatus {
  status: string;
  count: number;
  amount: number;
}

export interface TopClient {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  invoiceCount: number;
}

export interface RecentActivity {
  id: string;
  type: 'invoice_created' | 'invoice_paid' | 'invoice_sent' | 'client_added';
  description: string;
  createdAt: string;
}
