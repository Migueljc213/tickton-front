import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
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

    return response;
  },

  logout(): void {
    apiClient.removeToken();
  },

  isAuthenticated(): boolean {
    return apiClient.getToken() !== null;
  },
};

export default authService;
