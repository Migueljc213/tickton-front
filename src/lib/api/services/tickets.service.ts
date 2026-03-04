import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  FindTicketsByEventIdResponse,
  FindAllTicketsResponse,
} from '@/types/api';

export const ticketsService = {
  async getAllTickets(): Promise<FindAllTicketsResponse> {
    return apiClient.get<FindAllTicketsResponse>(API_ENDPOINTS.tickets.base);
  },

  async getTicketById(id: number): Promise<Ticket> {
    return apiClient.get<Ticket>(`${API_ENDPOINTS.tickets.base}/${id}`);
  },

  async getTicketsByEventId(eventId: number): Promise<FindTicketsByEventIdResponse> {
    return apiClient.get<FindTicketsByEventIdResponse>(
      API_ENDPOINTS.tickets.event(eventId),
      { requireAuth: false }
    );
  },

  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    return apiClient.post<Ticket>(API_ENDPOINTS.tickets.base, data);
  },

  async updateTicket(id: number, data: UpdateTicketRequest): Promise<Ticket> {
    return apiClient.patch<Ticket>(`${API_ENDPOINTS.tickets.base}/${id}`, data);
  },

  async deleteTicket(id: number): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.tickets.base}/${id}`);
  },
};

export default ticketsService;
