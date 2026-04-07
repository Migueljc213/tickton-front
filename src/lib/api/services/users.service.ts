import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  FindAllUsersResponse,
} from '@/types/api';

export const usersService = {
  async getAllUsers(): Promise<FindAllUsersResponse> {
    return apiClient.get<FindAllUsersResponse>(API_ENDPOINTS.users.base);
  },

  async getUserById(id: number): Promise<User> {
    return apiClient.get<User>(`${API_ENDPOINTS.users.base}/${id}`);
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    return apiClient.post<User>(API_ENDPOINTS.users.base, data, { requireAuth: false });
  },

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    return apiClient.patch<User>(`${API_ENDPOINTS.users.base}/${id}`, data);
  },

  async deleteUser(id: number): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.users.base}/${id}`);
  },
};

export default usersService;
