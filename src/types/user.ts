export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  preferences: {
    notifications: boolean;
    emailMarketing: boolean;
    location?: {
      city: string;
      state: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Organizer extends User {
  role: 'organizer';
  companyName?: string;
  document: string; // CPF/CNPJ
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  bankAccount?: {
    bank: string;
    agency: string;
    account: string;
  };
  events: string[]; // Event IDs
}

export interface Admin extends User {
  role: 'admin';
  permissions: AdminPermission[];
}

export type UserRole = 'participant' | 'organizer' | 'admin';

export type AdminPermission = 
  | 'manage_users'
  | 'manage_events'
  | 'manage_organizers'
  | 'view_analytics'
  | 'manage_payments'
  | 'manage_support';

export interface UserSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface EventCollaborator {
  id: string;
  eventId: string;
  userId: string;
  user: User;
  role: EventRole;
  permissions: EventPermission[];
  invitedBy: string;
  invitedAt: string;
  acceptedAt?: string;
  isActive: boolean;
}

export type EventRole = 'owner' | 'manager' | 'marketing' | 'finance' | 'checkin' | 'custom';

export type EventPermission = 
  | 'view_analytics'
  | 'manage_tickets'
  | 'manage_participants'
  | 'send_emails'
  | 'manage_checkin'
  | 'view_finances'
  | 'manage_event_details'
  | 'manage_collaborators';
