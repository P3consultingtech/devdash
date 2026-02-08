import apiClient from '@/lib/api-client';
import type { LoginInput, RegisterInput, LoginResponse, ApiResponse, AuthUser } from '@devdash/shared';

export async function loginApi(data: LoginInput) {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  return res.data.data!;
}

export async function registerApi(data: RegisterInput) {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data);
  return res.data.data!;
}

export async function getMeApi() {
  const res = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
  return res.data.data!;
}
