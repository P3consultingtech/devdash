import apiClient from '@/lib/api-client';
import type { CreateInvoiceInput, InvoiceListQuery, InvoiceStatus, ApiResponse, PaginatedResponse } from '@devdash/shared';

export async function listInvoicesApi(params: Partial<InvoiceListQuery>) {
  const res = await apiClient.get<ApiResponse<PaginatedResponse<any>>>('/invoices', { params });
  return res.data.data!;
}

export async function getInvoiceApi(id: string) {
  const res = await apiClient.get<ApiResponse<any>>(`/invoices/${id}`);
  return res.data.data!;
}

export async function createInvoiceApi(data: CreateInvoiceInput) {
  const res = await apiClient.post<ApiResponse<any>>('/invoices', data);
  return res.data.data!;
}

export async function updateInvoiceApi(id: string, data: CreateInvoiceInput) {
  const res = await apiClient.put<ApiResponse<any>>(`/invoices/${id}`, data);
  return res.data.data!;
}

export async function deleteInvoiceApi(id: string) {
  await apiClient.delete(`/invoices/${id}`);
}

export async function updateInvoiceStatusApi(id: string, status: InvoiceStatus) {
  const res = await apiClient.patch<ApiResponse<any>>(`/invoices/${id}/status`, { status });
  return res.data.data!;
}

export async function duplicateInvoiceApi(id: string) {
  const res = await apiClient.post<ApiResponse<any>>(`/invoices/${id}/duplicate`);
  return res.data.data!;
}

export async function getNextNumberApi() {
  const res = await apiClient.get<ApiResponse<{ number: string; year: number; sequenceNumber: number }>>('/invoices/next-number');
  return res.data.data!;
}

export function getInvoicePdfUrl(id: string): string {
  return `/api/v1/invoices/${id}/pdf`;
}
