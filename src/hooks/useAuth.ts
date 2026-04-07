import { useState, useCallback } from 'react';
import { authService, apiClient } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils/error-handler';
import type { LoginRequest, LoginResponse } from '@/types/api';

const DEFAULT_ERROR_MESSAGE = 'Failed to login';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGE;
      setError(errorMessage);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
  }, []);

  const getUserId = useCallback(() => {
    return apiClient.getUserId();
  }, []);

  return {
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    getUserId,
  };
};
