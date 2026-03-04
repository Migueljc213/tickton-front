import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  SearchEventsParams,
  SearchEventsResponse,
  FindAllEventsResponse,
  EventPost,
  CreateEventPostRequest,
} from '@/types/api';

const buildSearchQuery = (params: SearchEventsParams): string => {
  const queryParams = new URLSearchParams();
  
  if (params.title) queryParams.append('title', params.title);
  if (params.category) queryParams.append('category', params.category);
  if (params.city) queryParams.append('city', params.city);
  if (params.state) queryParams.append('state', params.state);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.isPublished !== undefined) {
    queryParams.append('isPublished', params.isPublished.toString());
  }

  return queryParams.toString();
};

export const eventsService = {
  async getAllEvents(): Promise<FindAllEventsResponse> {
    return apiClient.get<FindAllEventsResponse>(API_ENDPOINTS.events.base);
  },

  async getEventById(id: number): Promise<Event> {
    return apiClient.get<Event>(`${API_ENDPOINTS.events.base}/${id}`);
  },

  async searchEvents(params: SearchEventsParams): Promise<SearchEventsResponse> {
    const queryString = buildSearchQuery(params);
    const url = queryString 
      ? `${API_ENDPOINTS.events.search}?${queryString}`
      : API_ENDPOINTS.events.search;

    return apiClient.get<SearchEventsResponse>(url, { requireAuth: false });
  },

  async createEvent(data: CreateEventRequest): Promise<Event> {
    return apiClient.post<Event>(API_ENDPOINTS.events.base, data);
  },

  async updateEvent(id: number, data: UpdateEventRequest): Promise<Event> {
    return apiClient.patch<Event>(`${API_ENDPOINTS.events.base}/${id}`, data);
  },

  async deleteEvent(id: number): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.events.base}/${id}`);
  },

  async getEventPosts(eventId: number): Promise<EventPost[]> {
    return apiClient.get<EventPost[]>(
      API_ENDPOINTS.events.posts(eventId), 
      { requireAuth: false }
    );
  },

  async createEventPost(eventId: number, data: CreateEventPostRequest): Promise<EventPost> {
    return apiClient.post<EventPost>(API_ENDPOINTS.events.posts(eventId), data);
  },
};

export default eventsService;
