import apiClient from '@/lib/api-client';
import type {
  UpdateBusinessProfileInput,
  UpdateUserSettingsInput,
  UpdateProfileInput,
  ApiResponse,
  UserProfileResponse,
  BusinessProfileResponse,
  UserSettingsResponse,
} from '@devdash/shared';

export async function getProfileApi() {
  const res = await apiClient.get<ApiResponse<UserProfileResponse>>('/settings/profile');
  return res.data.data!;
}

export async function updateProfileApi(data: UpdateProfileInput) {
  const res = await apiClient.put<ApiResponse<UserProfileResponse>>('/settings/profile', data);
  return res.data.data!;
}

export async function getBusinessProfileApi() {
  const res = await apiClient.get<ApiResponse<BusinessProfileResponse>>('/settings/business');
  return res.data.data!;
}

export async function updateBusinessProfileApi(data: UpdateBusinessProfileInput) {
  const res = await apiClient.put<ApiResponse<BusinessProfileResponse>>('/settings/business', data);
  return res.data.data!;
}

export async function getSettingsApi() {
  const res = await apiClient.get<ApiResponse<UserSettingsResponse>>('/settings/preferences');
  return res.data.data!;
}

export async function updateSettingsApi(data: UpdateUserSettingsInput) {
  const res = await apiClient.put<ApiResponse<UserSettingsResponse>>('/settings/preferences', data);
  return res.data.data!;
}

export async function uploadLogoApi(file: File) {
  const formData = new FormData();
  formData.append('logo', file);
  const res = await apiClient.post<ApiResponse<BusinessProfileResponse>>(
    '/settings/logo',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return res.data.data!;
}

export async function deleteLogoApi() {
  const res = await apiClient.delete<ApiResponse<BusinessProfileResponse>>('/settings/logo');
  return res.data.data!;
}
