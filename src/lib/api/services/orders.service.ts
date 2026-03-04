import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  FindOrdersByUserIdResponse,
  FindOrderItemByQrCodeResponse,
  CheckInRequest,
  CheckInResponse,
  CheckInDashboardResponse,
  GetParticipantsListResponse,
  PlatformRevenueResponse,
} from '@/types/api';

const buildParticipantsUrl = (eventId: number, exportFormat?: 'csv'): string => {
  const baseUrl = API_ENDPOINTS.orders.participants(eventId);
  return exportFormat === 'csv' ? `${baseUrl}?export=csv` : baseUrl;
};

const fetchCsvExport = async (url: string): Promise<Blob> => {
  const baseURL = apiClient.getBaseURL();
  const token = apiClient.getToken();
  
  const response = await fetch(`${baseURL}${url}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export participants');
  }

  return await response.blob();
};

export const ordersService = {
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return apiClient.post<CreateOrderResponse>(API_ENDPOINTS.orders.base, data);
  },

  async getOrdersByUserId(userId: number): Promise<FindOrdersByUserIdResponse> {
    return apiClient.get<FindOrdersByUserIdResponse>(API_ENDPOINTS.orders.user(userId));
  },

  async getOrderItemByQrCode(qrCode: string): Promise<FindOrderItemByQrCodeResponse> {
    return apiClient.get<FindOrderItemByQrCodeResponse>(API_ENDPOINTS.orders.qrCode(qrCode));
  },

  async checkIn(data: CheckInRequest): Promise<CheckInResponse> {
    return apiClient.post<CheckInResponse>(API_ENDPOINTS.orders.checkIn, data);
  },

  async getCheckInDashboard(eventId: number): Promise<CheckInDashboardResponse> {
    return apiClient.get<CheckInDashboardResponse>(API_ENDPOINTS.orders.dashboard(eventId));
  },

  async getParticipantsList(
    eventId: number, 
    exportFormat?: 'csv'
  ): Promise<GetParticipantsListResponse | Blob> {
    const url = buildParticipantsUrl(eventId, exportFormat);

    if (exportFormat === 'csv') {
      return fetchCsvExport(url);
    }

    return apiClient.get<GetParticipantsListResponse>(url);
  },

  async getPlatformRevenue(): Promise<PlatformRevenueResponse> {
    return apiClient.get<PlatformRevenueResponse>(API_ENDPOINTS.orders.platformRevenue);
  },
};

export default ordersService;
