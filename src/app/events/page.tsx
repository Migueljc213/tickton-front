'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHeart, FaShare } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useEvents } from '@/hooks';
import { formatPrice, formatDate } from '@/lib/utils/format';
import type { Event } from '@/types/api';

const CATEGORIES = [
  { value: 'music', label: 'Música', icon: '🎵' },
  { value: 'party', label: 'Festa', icon: '🎉' },
  { value: 'course', label: 'Curso', icon: '📚' },
  { value: 'theater', label: 'Teatro', icon: '🎭' },
  { value: 'sports', label: 'Esportes', icon: '⚽' },
  { value: 'conference', label: 'Conferência', icon: '🎤' },
  { value: 'workshop', label: 'Workshop', icon: '🔧' },
  { value: 'exhibition', label: 'Exposição', icon: '🖼️' },
  { value: 'festival', label: 'Festival', icon: '🎪' },
  { value: 'other', label: 'Outros', icon: '🎊' },
] as const;

interface EventInfoItemProps {
  icon: IconType;
  children: React.ReactNode;
}

const EventInfoItem = ({ icon: Icon, children }: EventInfoItemProps) => (
  <div className="flex items-center text-sm text-gray-700">
    <div className="w-8 h-8 bg-turquoise/10 rounded-full flex items-center justify-center mr-3">
      <Icon className="w-4 h-4 text-turquoise" />
    </div>
    <span className="font-medium">{children}</span>
  </div>
);

interface ActionButtonProps {
  icon: IconType;
  onClick: (e: React.MouseEvent) => void;
}

const ActionButton = ({ icon: Icon, onClick }: ActionButtonProps) => (
  <Button
    variant="ghost"
    size="icon"
    className="w-8 h-8 bg-white/95 hover:bg-white text-gray-600 hover:text-turquoise shadow-md hover:shadow-lg transition-all"
    onClick={onClick}
  >
    <Icon className="w-4 h-4" />
  </Button>
);

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
}

const FilterField = ({ label, children }: FilterFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-dark-gray mb-2">
      {label}
    </label>
    {children}
  </div>
);

export default function EventsPage() {
  const router = useRouter();
  const { events, loading, error, searchEvents } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '🎊';
  };

  const handleSearch = async () => {
    await searchEvents({
      title: searchTerm || undefined,
      category: selectedCategory || undefined,
      city: selectedCity || undefined,
      state: selectedState || undefined,
      isPublished: true,
    });
  };

  const handleEventClick = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  const eventsCount = events.length;
  const hasEvents = eventsCount > 0;

  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-gray mb-4">
            Descobrir Eventos
          </h1>
          <p className="text-xl text-medium-gray">
            Encontre eventos incríveis na sua cidade ou explore novas experiências.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
              <input
                type="text"
                placeholder="Buscar eventos, artistas, locais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white"
            >
              <FaFilter className="mr-2" />
              Filtros
            </Button>
            <Button 
              className="bg-turquoise hover:bg-turquoise/90 text-white"
              onClick={handleSearch}
              disabled={loading}
            >
              <FaSearch className="mr-2" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t">
              <FilterField label="Categoria">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                >
                  <option value="">Todas as categorias</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField label="Cidade">
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                />
              </FilterField>

              <FilterField label="Estado">
                <input
                  type="text"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value.toUpperCase())}
                  placeholder="Ex: SP"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent uppercase"
                />
              </FilterField>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-medium-gray">
            {loading 
              ? 'Carregando...' 
              : `${eventsCount} evento${eventsCount !== 1 ? 's' : ''} encontrado${eventsCount !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {loading && !hasEvents ? (
          <div className="text-center py-12">
            <p className="text-medium-gray">Carregando eventos...</p>
          </div>
        ) : !hasEvents ? (
          <div className="text-center py-12">
            <p className="text-medium-gray">Nenhum evento encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-200 hover:border-turquoise/30 bg-white overflow-hidden"
                onClick={() => handleEventClick(event.id)}
              >
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-turquoise/10 via-light-green/5 to-turquoise/5 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <span className="text-5xl opacity-80">{getCategoryIcon(event.category)}</span>
                    {event.isPublished && (
                      <div className="absolute top-3 left-3 bg-turquoise text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                        Publicado
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <ActionButton
                        icon={FaHeart}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <ActionButton
                        icon={FaShare}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-turquoise transition-colors mb-3">
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm bg-turquoise/15 text-turquoise-800 px-3 py-1.5 rounded-full font-semibold">
                          {getCategoryLabel(event.category)}
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                          Ver detalhes
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 bg-gray-50/50 rounded-lg p-3">
                      <EventInfoItem icon={FaCalendarAlt}>
                        {formatDate(event.eventDate)}
                      </EventInfoItem>
                      
                      <EventInfoItem icon={FaMapMarkerAlt}>
                        <span className="truncate">
                          {event.venueName || event.address || 'Local a definir'}
                          {event.city && `, ${event.city}`}
                          {event.state && ` - ${event.state}`}
                        </span>
                      </EventInfoItem>
                      
                      {event.maxAttendees && (
                        <EventInfoItem icon={FaUsers}>
                          Até {event.maxAttendees} participantes
                        </EventInfoItem>
                      )}
                    </div>

                    <Button className="w-full bg-turquoise hover:bg-turquoise-600 text-white font-bold py-3 group-hover:shadow-lg transition-all duration-300 hover:scale-[1.02] rounded-lg">
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
