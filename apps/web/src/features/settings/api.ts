import apiClient from '@/lib/api-client';
import type { UpdateBusinessProfileInput, UpdateUserSettingsInput, UpdateProfileInput, ApiResponse } from '@devdash/shared';

export async function getProfileApi() {
  const res = await apiClient.get<ApiResponse<any>>('/settings/profile');
  return res.data.data!;
}

export async function updateProfileApi(data: UpdateProfileInput) {
  const res = await apiClient.put<ApiResponse<any>>('/settings/profile', data);
  return res.data.data!;
}

export async function getBusinessProfileApi() {
  const res = await apiClient.get<ApiResponse<any>>('/settings/business');
  return res.data.data!;
}

export async function updateBusinessProfileApi(data: UpdateBusinessProfileInput) {
  const res = await apiClient.put<ApiResponse<any>>('/settings/business', data);
  return res.data.data!;
}

export async function getSettingsApi() {
  const res = await apiClient.get<ApiResponse<any>>('/settings/preferences');
  return res.data.data!;
}

export async function updateSettingsApi(data: UpdateUserSettingsInput) {
  const res = await apiClient.put<ApiResponse<any>>('/settings/preferences', data);
  return res.data.data!;
}
