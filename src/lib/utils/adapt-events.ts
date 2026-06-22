import type { Event as ApiEvent } from '@/types/api';
import type { Event as CardEvent } from '@/types/event';

export function adaptApiEvent(e: ApiEvent): CardEvent {
  return {
    id: String(e.id),
    title: e.title,
    description: e.description ?? '',
    date: e.eventDate,
    time: new Date(e.eventDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    location: {
      name: e.venueName || e.city || 'Local a definir',
      address: e.address ?? '',
      city: e.city ?? '',
      state: e.state ?? '',
      zipCode: e.zipcode ?? '',
      capacity: e.maxAttendees ?? 0,
    },
    organizer: { id: String(e.organizerId), name: 'Organizador', email: '', phone: '' },
    category: (e.category as CardEvent['category']) ?? 'other',
    type: 'paid',
    featured: !!(e.isPublished && e.isPublic),
    status: 'active',
    image: e.bannerUrl ?? '',
    tickets: [],
    tags: [],
    createdAt: e.createdAt ?? '',
    updatedAt: e.updatedAt ?? '',
  };
}
