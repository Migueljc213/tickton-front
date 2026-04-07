export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
  },
  events: {
    base: '/events',
    search: '/events/search',
    posts: (eventId: number) => `/events/${eventId}/posts`,
  },
  orders: {
    base: '/orders',
    user: (userId: number) => `/orders/user/${userId}`,
    qrCode: (qrCode: string) => `/orders/qr-code/${qrCode}`,
    checkIn: '/orders/check-in',
    dashboard: (eventId: number) => `/orders/dashboard/event/${eventId}`,
    participants: (eventId: number) => `/orders/participants/event/${eventId}`,
    platformRevenue: '/orders/platform/revenue',
  },
  organizers: {
    base: '/organizers',
    approve: (id: number) => `/organizers/${id}/approve`,
  },
  tickets: {
    base: '/tickets',
    event: (eventId: number) => `/tickets/event/${eventId}`,
  },
  users: {
    base: '/users',
  },
} as const;
