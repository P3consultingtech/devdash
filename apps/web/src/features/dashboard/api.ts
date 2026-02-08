import apiClient from '@/lib/api-client';
import type { ApiResponse, DashboardSummary, MonthlyRevenue, InvoicesByStatus, TopClient, RecentActivity } from '@devdash/shared';

export async function getSummaryApi(year?: number) {
  const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary', { params: { year } });
  return res.data.data!;
}

export async function getRevenueApi(year?: number) {
  const res = await apiClient.get<ApiResponse<MonthlyRevenue[]>>('/dashboard/revenue', { params: { year } });
  return res.data.data!;
}

export async function getInvoicesByStatusApi(year?: number) {
  const res = await apiClient.get<ApiResponse<InvoicesByStatus[]>>('/dashboard/invoices-by-status', { params: { year } });
  return res.data.data!;
}

export async function getTopClientsApi(year?: number) {
  const res = await apiClient.get<ApiResponse<TopClient[]>>('/dashboard/top-clients', { params: { year } });
  return res.data.data!;
}

export async function getRecentActivityApi() {
  const res = await apiClient.get<ApiResponse<RecentActivity[]>>('/dashboard/recent-activity');
  return res.data.data!;
}
