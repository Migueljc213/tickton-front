'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUsers, 
  FaHeart, 
  FaShare,
  FaTicketAlt
} from 'react-icons/fa';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  showDistance?: boolean;
  distance?: number;
}

export default function EventCard({ event, showDistance = false, distance }: EventCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      music: '🎵',
      party: '🎉',
      course: '📚',
      theater: '🎭',
      sports: '⚽',
      conference: '🎤',
      workshop: '🔧',
      exhibition: '🖼️',
      festival: '🎪',
      other: '🎊'
    };
    return icons[category] || '🎊';
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      music: 'Música',
      party: 'Festa',
      course: 'Curso',
      theater: 'Teatro',
      sports: 'Esportes',
      conference: 'Conferência',
      workshop: 'Workshop',
      exhibition: 'Exposição',
      festival: 'Festival',
      other: 'Outros'
    };
    return labels[category] || 'Outros';
  };

  const getAvailableTickets = () => {
    return event.tickets.reduce((total, ticket) => total + (ticket.quantity - ticket.sold), 0);
  };

  const getMinPrice = () => {
    const prices = event.tickets
      .filter(ticket => ticket.isActive)
      .map(ticket => ticket.price);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  return (
    <Card className="w-80 flex-shrink-0 hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <Link href={`/events/${event.id}`}>
        <div className="relative">
          {/* Event Image */}
          <div className="aspect-video bg-light-gray rounded-t-lg flex items-center justify-center relative overflow-hidden">
            <span className="text-4xl">{getCategoryIcon(event.category)}</span>
            {event.featured && (
              <div className="absolute top-3 left-3 bg-turquoise text-white px-2 py-1 rounded-full text-xs font-semibold">
                Destaque
              </div>
            )}
            {showDistance && distance && (
              <div className="absolute top-3 right-3 bg-white/90 text-dark-gray px-2 py-1 rounded-full text-xs font-medium">
                {distance} km
              </div>
            )}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 bg-white/90 hover:bg-white text-medium-gray"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle favorite
                }}
              >
                <FaHeart className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 bg-white/90 hover:bg-white text-medium-gray"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle share
                }}
              >
                <FaShare className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Event Title */}
              <div>
                <h3 className="font-semibold text-dark-gray text-lg line-clamp-2 group-hover:text-turquoise transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm bg-light-green/20 text-dark-blue px-2 py-1 rounded-full">
                    {getCategoryLabel(event.category)}
                  </span>
                  <span className="text-sm text-medium-gray">
                    {event.type === 'free' ? 'Gratuito' : formatPrice(getMinPrice())}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-medium-gray">
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-turquoise" />
                  {formatDate(event.date)} às {event.time}
                </div>
                
                <div className="flex items-center text-sm text-medium-gray">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2 text-turquoise" />
                  <span className="truncate">{event.location.name}, {event.location.city}</span>
                </div>
                
                <div className="flex items-center text-sm text-medium-gray">
                  <FaUsers className="w-4 h-4 mr-2 text-turquoise" />
                  {getAvailableTickets()} ingressos disponíveis
                </div>
              </div>

              {/* Organizer */}
              <div className="pt-2 border-t border-light-gray">
                <p className="text-xs text-medium-gray">
                  por <span className="font-medium text-dark-gray">{event.organizer.name}</span>
                </p>
              </div>

              {/* Action Button */}
              <Button className="w-full bg-turquoise hover:bg-turquoise/90 text-white group-hover:shadow-md transition-all">
                <FaTicketAlt className="mr-2 w-4 h-4" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
