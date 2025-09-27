export interface Location {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  capacity: number;
}

export interface Organizer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: Location;
  organizer: Organizer;
  category: 'music' | 'party' | 'course' | 'theater' | 'sports' | 'conference' | 'workshop' | 'exhibition' | 'festival' | 'other';
  type: 'free' | 'paid';
  featured: boolean;
  status: 'active' | 'inactive' | 'cancelled' | 'completed';
  image: string;
  tickets: Ticket[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  category?: string;
  type?: 'free' | 'paid';
  date?: string;
  location?: string;
  price?: {
    min: number;
    max: number;
  };
}

export interface EventSearchParams {
  query?: string;
  filters?: EventFilters;
  sortBy?: 'date' | 'price' | 'popularity' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}