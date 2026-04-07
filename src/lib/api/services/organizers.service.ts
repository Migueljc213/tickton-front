import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  Organizer,
  CreateOrganizerRequest,
  UpdateOrganizerRequest,
  ApproveOrganizerRequest,
  FindAllOrganizersResponse,
} from '@/types/api';

const authOptions = { requireAuth: false };

export const organizersService = {
  async getAllOrganizers(): Promise<FindAllOrganizersResponse> {
    return apiClient.get<FindAllOrganizersResponse>(
      API_ENDPOINTS.organizers.base,
      authOptions
    );
  },

  async getOrganizerById(id: number): Promise<Organizer> {
    return apiClient.get<Organizer>(
      `${API_ENDPOINTS.organizers.base}/${id}`,
      authOptions
    );
  },

  async createOrganizer(data: CreateOrganizerRequest): Promise<Organizer> {
    return apiClient.post<Organizer>(API_ENDPOINTS.organizers.base, data);
  },

  async updateOrganizer(id: number, data: UpdateOrganizerRequest): Promise<Organizer> {
    return apiClient.patch<Organizer>(`${API_ENDPOINTS.organizers.base}/${id}`, data);
  },

  async deleteOrganizer(id: number): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.organizers.base}/${id}`);
  },

  async approveOrganizer(id: number, data: ApproveOrganizerRequest): Promise<Organizer> {
    return apiClient.patch<Organizer>(API_ENDPOINTS.organizers.approve(id), data);
  },
};

export default organizersService;
