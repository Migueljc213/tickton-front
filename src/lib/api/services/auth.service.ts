import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import { storage } from '@/lib/utils/storage';
import type { LoginRequest, LoginResponse } from '@/types/api';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.auth.login,
      data,
      { requireAuth: false }
    );

    apiClient.setToken(response.accessToken);
    apiClient.setUserId(response.userId);
    storage.setUserEmail(response.email);
    storage.setUserName(response.name ?? response.email);
    storage.setUserRole(response.role ?? 'participant');

    return response;
  },

  logout(): void {
    apiClient.removeToken();
    storage.removeUserId();
    storage.removeUserEmail();
    storage.removeUserName();
    storage.removeUserRole();
  },

  isAuthenticated(): boolean {
    return apiClient.getToken() !== null;
  },
};

export default authService;
