import apiClient from '@/lib/api-client';
import type {
  CreateInvoiceInput,
  InvoiceListQuery,
  InvoiceStatus,
  ApiResponse,
  PaginatedResponse,
  InvoiceListItem,
  InvoiceDetailResponse,
} from '@devdash/shared';

export async function listInvoicesApi(params: Partial<InvoiceListQuery>) {
  const res = await apiClient.get<ApiResponse<PaginatedResponse<InvoiceListItem>>>('/invoices', {
    params,
  });
  return res.data.data!;
}

export async function getInvoiceApi(id: string) {
  const res = await apiClient.get<ApiResponse<InvoiceDetailResponse>>(`/invoices/${id}`);
  return res.data.data!;
}

export async function createInvoiceApi(data: CreateInvoiceInput) {
  const res = await apiClient.post<ApiResponse<InvoiceDetailResponse>>('/invoices', data);
  return res.data.data!;
}

export async function updateInvoiceApi(id: string, data: CreateInvoiceInput) {
  const res = await apiClient.put<ApiResponse<InvoiceDetailResponse>>(`/invoices/${id}`, data);
  return res.data.data!;
}

export async function deleteInvoiceApi(id: string) {
  await apiClient.delete(`/invoices/${id}`);
}

export async function updateInvoiceStatusApi(id: string, status: InvoiceStatus) {
  const res = await apiClient.patch<ApiResponse<InvoiceDetailResponse>>(`/invoices/${id}/status`, {
    status,
  });
  return res.data.data!;
}

export async function duplicateInvoiceApi(id: string) {
  const res = await apiClient.post<ApiResponse<InvoiceDetailResponse>>(`/invoices/${id}/duplicate`);
  return res.data.data!;
}

export async function getNextNumberApi() {
  const res =
    await apiClient.get<ApiResponse<{ number: string; year: number; sequenceNumber: number }>>(
      '/invoices/next-number',
    );
  return res.data.data!;
}

export function getInvoicePdfUrl(id: string): string {
  return `/api/v1/invoices/${id}/pdf`;
}
