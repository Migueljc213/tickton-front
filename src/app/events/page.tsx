'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHeart, FaShare } from 'react-icons/fa';
import { Event } from '@/types/event';

// Mock data para demonstração
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Música Eletrônica 2025',
    description: 'O maior festival de música eletrônica do Brasil com os melhores DJs nacionais e internacionais.',
    date: '2025-03-15',
    time: '20:00',
    location: {
      name: 'Parque Ibirapuera',
      address: 'Av. Pedro Álvares Cabral',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04094-050',
      capacity: 50000
    },
    image: '/api/placeholder/400/250',
    category: 'music',
    type: 'paid',
    organizer: {
      id: '1',
      name: 'Eventos SP',
      email: 'contato@eventossp.com.br',
      phone: '(11) 99999-9999'
    },
    tickets: [
      {
        id: '1',
        name: 'Pista',
        price: 120,
        quantity: 1000,
        sold: 750,
        isActive: true
      }
    ],
    status: 'active',
    featured: true,
    tags: ['música eletrônica', 'festival', 'DJs'],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    id: '2',
    title: 'Workshop de Marketing Digital',
    description: 'Aprenda as melhores estratégias de marketing digital com especialistas do mercado.',
    date: '2025-02-20',
    time: '09:00',
    location: {
      name: 'Centro de Convenções',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      capacity: 200
    },
    image: '/api/placeholder/400/250',
    category: 'workshop',
    type: 'paid',
    organizer: {
      id: '2',
      name: 'Digital Academy',
      email: 'contato@digitalacademy.com.br',
      phone: '(11) 88888-8888'
    },
    tickets: [
      {
        id: '2',
        name: 'Participante',
        price: 250,
        quantity: 50,
        sold: 30,
        isActive: true
      }
    ],
    status: 'active',
    featured: false,
    tags: ['marketing', 'workshop', 'digital'],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  }
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories: { value: string; label: string; icon: string }[] = [
    { value: 'music', label: 'Música', icon: '🎵' },
    { value: 'party', label: 'Festa', icon: '🎉' },
    { value: 'course', label: 'Curso', icon: '📚' },
    { value: 'theater', label: 'Teatro', icon: '🎭' },
    { value: 'sports', label: 'Esportes', icon: '⚽' },
    { value: 'conference', label: 'Conferência', icon: '🎤' },
    { value: 'workshop', label: 'Workshop', icon: '🔧' },
    { value: 'exhibition', label: 'Exposição', icon: '🖼️' },
    { value: 'festival', label: 'Festival', icon: '🎪' },
    { value: 'other', label: 'Outros', icon: '🎊' }
  ];

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

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '🎊';
  };

  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-gray mb-4">
            Descobrir Eventos
          </h1>
          <p className="text-xl text-medium-gray">
            Encontre eventos incríveis na sua cidade ou explore novas experiências.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Search Bar */}
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
            <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
              <FaSearch className="mr-2" />
              Buscar
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t">
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Tipo
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                >
                  <option value="">Todos os tipos</option>
                  <option value="free">Gratuito</option>
                  <option value="paid">Pago</option>
                  <option value="donation">Doação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Cidade
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                >
                  <option value="">Todas as cidades</option>
                  <option value="sao-paulo">São Paulo</option>
                  <option value="rio-de-janeiro">Rio de Janeiro</option>
                  <option value="belo-horizonte">Belo Horizonte</option>
                  <option value="salvador">Salvador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Data
                </label>
                <select className="w-full px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent">
                  <option value="">Qualquer data</option>
                  <option value="today">Hoje</option>
                  <option value="tomorrow">Amanhã</option>
                  <option value="weekend">Fim de semana</option>
                  <option value="next-week">Próxima semana</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-medium-gray">
            {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="relative">
                <div className="aspect-video bg-light-gray rounded-t-lg flex items-center justify-center">
                  <span className="text-4xl">{getCategoryIcon(event.category)}</span>
                </div>
                {event.featured && (
                  <div className="absolute top-3 left-3 bg-turquoise text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Destaque
                  </div>
                )}
                <div className="absolute top-3 right-3 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 bg-white/90 hover:bg-white text-medium-gray"
                  >
                    <FaHeart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 bg-white/90 hover:bg-white text-medium-gray"
                  >
                    <FaShare className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-turquoise transition-colors">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm bg-light-green/20 text-dark-blue px-2 py-1 rounded-full">
                        {getCategoryLabel(event.category)}
                      </span>
                      <span className="text-sm text-medium-gray">
                        {event.type === 'free' ? 'Gratuito' : formatPrice(event.tickets[0]?.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-medium-gray">
                    <FaCalendarAlt className="w-4 h-4 mr-2" />
                    {formatDate(event.date)} às {event.time}
                  </div>
                  
                  <div className="flex items-center text-sm text-medium-gray">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                    {event.location.name}, {event.location.city}
                  </div>
                  
                  <div className="flex items-center text-sm text-medium-gray">
                    <FaUsers className="w-4 h-4 mr-2" />
                    {event.tickets[0]?.sold || 0} de {event.tickets[0]?.quantity || 0} ingressos vendidos
                  </div>

                  <div className="pt-2">
                    <Button className="w-full bg-turquoise hover:bg-turquoise/90 text-white">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white">
            Carregar Mais Eventos
          </Button>
        </div>
      </div>
    </div>
  );
}
