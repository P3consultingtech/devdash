import apiClient from '@/lib/api-client';
import type {
  CreateClientInput,
  ClientListQuery,
  ApiResponse,
  PaginatedResponse,
  ClientResponse,
  ClientDetailResponse,
} from '@devdash/shared';

export async function listClientsApi(params: Partial<ClientListQuery>) {
  const res = await apiClient.get<ApiResponse<PaginatedResponse<ClientResponse>>>('/clients', {
    params,
  });
  return res.data.data!;
}

export async function getClientApi(id: string) {
  const res = await apiClient.get<ApiResponse<ClientDetailResponse>>(`/clients/${id}`);
  return res.data.data!;
}

export async function createClientApi(data: CreateClientInput) {
  const res = await apiClient.post<ApiResponse<ClientResponse>>('/clients', data);
  return res.data.data!;
}

export async function updateClientApi(id: string, data: CreateClientInput) {
  const res = await apiClient.put<ApiResponse<ClientResponse>>(`/clients/${id}`, data);
  return res.data.data!;
}

export async function deleteClientApi(id: string) {
  await apiClient.delete(`/clients/${id}`);
}
