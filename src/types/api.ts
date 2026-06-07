/**
 * API Types
 * Type definitions aligned with backend DTOs and entities
 */

// Base Entity
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  userId: number;
  email: string;
  name: string;
  role: string;
}

// Event Types
export interface Event extends BaseEntity {
  organizerId: number;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  eventEndDate?: string;
  locationType: string;
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  onlineUrl?: string;
  bannerUrl?: string;
  maxAttendees?: number;
  status: string;
  isPublic: boolean;
  isPublished: boolean;
  publishedAt?: string;
}

export interface CreateEventRequest {
  organizerId: number;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  eventEndDate?: string;
  locationType: string;
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  onlineUrl?: string;
  bannerUrl?: string;
  maxAttendees?: number;
  isPublic?: boolean;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  category?: string;
  eventDate?: string;
  eventEndDate?: string;
  locationType?: string;
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  onlineUrl?: string;
  bannerUrl?: string;
  maxAttendees?: number;
  isPublic?: boolean;
  status?: string;
  isPublished?: boolean;
}

export interface SearchEventsParams {
  title?: string;
  category?: string;
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
}

export interface SearchEventsResponse {
  events: Event[];
}

export interface EventPost extends BaseEntity {
  eventId: number;
  title: string;
  content: string;
  imageUrl?: string;
  publishedAt?: string;
}

export interface CreateEventPostRequest {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface FindAllEventsResponse {
  events: Event[];
}

// Ticket Types
export interface Ticket extends BaseEntity {
  eventId: number;
  name: string;
  description?: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  minPerOrder: number;
  maxPerOrder: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isActive: boolean;
  ticketType: string;
}

export interface CreateTicketRequest {
  eventId: number;
  name: string;
  description?: string;
  price: number;
  quantityAvailable: number;
  minPerOrder?: number;
  maxPerOrder?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isActive?: boolean;
  ticketType?: string;
}

export interface UpdateTicketRequest {
  name?: string;
  description?: string;
  price?: number;
  quantityAvailable?: number;
  minPerOrder?: number;
  maxPerOrder?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isActive?: boolean;
  ticketType?: string;
}

export interface FindTicketsByEventIdResponse {
  tickets: Ticket[];
}

export interface FindAllTicketsResponse {
  tickets: Ticket[];
}

// Order Types
export interface Order extends BaseEntity {
  userId: number;
  eventId: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  paymentId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

export interface OrderItem extends BaseEntity {
  orderId: number;
  ticketId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  qrCode: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: number;
}

export interface CreateOrderItemDto {
  ticketId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  userId: number;
  eventId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod?: string;
  notes?: string;
  items: CreateOrderItemDto[];
}

export interface CreateOrderResponse {
  order: Order;
  items: OrderItem[];
}

export interface FindOrdersByUserIdResponse {
  orders: Order[];
  items: OrderItem[][];
}

export interface FindOrderItemByQrCodeResponse {
  orderItem: OrderItem;
  order: Order;
  ticket: Ticket;
  event: Event;
}

export interface CheckInRequest {
  qrCode: string;
  checkedInBy: number;
}

export interface CheckInResponse {
  orderItem: OrderItem;
  message: string;
}

export interface CheckInDashboardResponse {
  eventId: number;
  totalTickets: number;
  checkedIn: number;
  pending: number;
  revenue: number;
  checkInsByDate: Array<{
    date: string;
    count: number;
  }>;
}

export interface Participant {
  orderItemId: number;
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  ticketName: string;
  ticketPrice: number;
  qrCode: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  purchasedAt: string;
}

export interface GetParticipantsListResponse {
  participants: Participant[];
}

export interface PlatformRevenueResponse {
  totalRevenue: number;
  totalOrders: number;
  totalTicketsSold: number;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
}

// Organizer Types
export interface Organizer extends BaseEntity {
  userId: number;
  companyName: string;
  cnpj: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface CreateOrganizerRequest {
  userId: number;
  companyName: string;
  cnpj: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
}

export interface UpdateOrganizerRequest {
  companyName?: string;
  cnpj?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive?: boolean;
}

export interface ApproveOrganizerRequest {
  isVerified: boolean;
}

export interface FindAllOrganizersResponse {
  organizers: Organizer[];
}

// User Types
export interface User extends BaseEntity {
  name: string;
  email: string;
  cpfCnpj: string;
  bankInfo?: string;
  role: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  cpfCnpj: string;
  bankInfo?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  cpfCnpj?: string;
  bankInfo?: string;
}

export interface FindAllUsersResponse {
  users: User[];
}

