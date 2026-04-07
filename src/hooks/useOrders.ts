import { useState, useCallback } from 'react';
import { ordersService } from '@/lib/api/services';
import { extractErrorMessage } from '@/lib/utils/error-handler';
import type { CreateOrderRequest, CreateOrderResponse, CheckInRequest } from '@/types/api';

const DEFAULT_ERROR_MESSAGES = {
  CREATE: 'Failed to create order',
  FETCH: 'Failed to fetch orders',
  CHECK_IN: 'Failed to check in',
  DASHBOARD: 'Failed to fetch dashboard',
  PARTICIPANTS: 'Failed to fetch participants',
} as const;

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await ordersService.createOrder(data);
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.CREATE;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrdersByUserId = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      return await ordersService.getOrdersByUserId(userId);
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.FETCH;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIn = useCallback(async (data: CheckInRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await ordersService.checkIn(data);
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.CHECK_IN;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCheckInDashboard = useCallback(async (eventId: number) => {
    setLoading(true);
    setError(null);
    try {
      return await ordersService.getCheckInDashboard(eventId);
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.DASHBOARD;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getParticipantsList = useCallback(async (eventId: number, exportFormat?: 'csv') => {
    setLoading(true);
    setError(null);
    try {
      return await ordersService.getParticipantsList(eventId, exportFormat);
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.PARTICIPANTS;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createOrder,
    getOrdersByUserId,
    checkIn,
    getCheckInDashboard,
    getParticipantsList,
  };
};
