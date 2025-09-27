'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FaTicketAlt, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaQrcode, 
  FaDownload, 
  FaShare, 
  FaClock,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaPlus
} from 'react-icons/fa';

// Mock data
const mockTickets = [
  {
    id: 'TKT-001',
    event: {
      id: '1',
      title: 'Festival de Música Eletrônica 2025',
      date: '2025-03-15',
      time: '20:00',
      location: {
        name: 'Parque Ibirapuera',
        address: 'Av. Pedro Álvares Cabral, s/n - Vila Mariana',
        city: 'São Paulo',
        state: 'SP'
      },
      image: '/api/placeholder/400/200'
    },
    ticketType: 'Pista',
    quantity: 2,
    unitPrice: 120,
    totalPrice: 240,
    purchaseDate: '2025-01-27T10:30:00Z',
    status: 'confirmed',
    qrCode: 'QR_CODE_BASE64_DATA',
    checkInDate: null
  },
  {
    id: 'TKT-002',
    event: {
      id: '2',
      title: 'Workshop de Marketing Digital',
      date: '2025-02-20',
      time: '09:00',
      location: {
        name: 'Centro de Convenções',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP'
      },
      image: '/api/placeholder/400/200'
    },
    ticketType: 'Participante',
    quantity: 1,
    unitPrice: 250,
    totalPrice: 250,
    purchaseDate: '2025-01-25T14:15:00Z',
    status: 'confirmed',
    qrCode: 'QR_CODE_BASE64_DATA_2',
    checkInDate: null
  },
  {
    id: 'TKT-003',
    event: {
      id: '3',
      title: 'Conferência de Tecnologia',
      date: '2025-01-10',
      time: '08:00',
      location: {
        name: 'Hotel Convention',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP'
      },
      image: '/api/placeholder/400/200'
    },
    ticketType: 'Participante',
    quantity: 1,
    unitPrice: 200,
    totalPrice: 200,
    purchaseDate: '2024-12-15T16:45:00Z',
    status: 'used',
    qrCode: 'QR_CODE_BASE64_DATA_3',
    checkInDate: '2025-01-10T08:30:00Z'
  }
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'used':
        return 'Utilizado';
      case 'cancelled':
        return 'Cancelado';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.event.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingTickets = filteredTickets.filter(ticket => 
    ticket.status === 'confirmed' && new Date(ticket.event.date) > new Date()
  );

  const pastTickets = filteredTickets.filter(ticket => 
    ticket.status === 'used' || new Date(ticket.event.date) <= new Date()
  );

  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Meus Ingressos</h1>
            <p className="text-medium-gray">Gerencie todos os seus ingressos em um só lugar</p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white">
              <FaPlus className="mr-2" />
              Adicionar à Wallet
            </Button>
            <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
              <FaDownload className="mr-2" />
              Baixar Todos
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  type="text"
                  placeholder="Buscar por evento ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="confirmed">Confirmado</option>
                <option value="used">Utilizado</option>
                <option value="cancelled">Cancelado</option>
                <option value="expired">Expirado</option>
              </select>
              <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
                <FaFilter className="mr-2" />
                Filtrar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-medium-gray">Total de Ingressos</p>
                  <p className="text-2xl font-bold text-dark-gray">{tickets.length}</p>
                </div>
                <div className="w-12 h-12 bg-turquoise/10 rounded-full flex items-center justify-center">
                  <FaTicketAlt className="w-6 h-6 text-turquoise" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-medium-gray">Próximos Eventos</p>
                  <p className="text-2xl font-bold text-dark-gray">{upcomingTickets.length}</p>
                </div>
                <div className="w-12 h-12 bg-light-green/20 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="w-6 h-6 text-dark-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-medium-gray">Eventos Passados</p>
                  <p className="text-2xl font-bold text-dark-gray">{pastTickets.length}</p>
                </div>
                <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                  <FaCheck className="w-6 h-6 text-coral" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-medium-gray">Total Gasto</p>
                  <p className="text-2xl font-bold text-dark-gray">
                    {formatPrice(tickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaTimes className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingTickets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">Próximos Eventos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map((ticket) => (
                <Card key={ticket.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-light-gray rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl">🎵</span>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg line-clamp-2">{ticket.event.title}</CardTitle>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-medium-gray">
                          <div className="flex items-center">
                            <FaCalendarAlt className="w-4 h-4 mr-1" />
                            {formatDate(ticket.event.date)}
                          </div>
                          <div className="flex items-center">
                            <FaClock className="w-4 h-4 mr-1" />
                            {ticket.event.time}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-medium-gray">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                        {ticket.event.location.city}, {ticket.event.location.state}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-medium-gray">{ticket.quantity}x {ticket.ticketType}</p>
                          <p className="font-semibold text-dark-gray">{formatPrice(ticket.totalPrice)}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQRCode(showQRCode === ticket.id ? null : ticket.id)}
                            className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white"
                          >
                            <FaQrcode className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FaDownload className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FaShare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {showQRCode === ticket.id && (
                        <div className="p-4 bg-white border border-light-gray rounded-lg">
                          <div className="text-center">
                            <div className="w-24 h-24 bg-light-gray rounded-lg mx-auto mb-3 flex items-center justify-center">
                              <span className="text-xs text-medium-gray">QR Code</span>
                            </div>
                            <p className="text-sm text-medium-gray">
                              Mostre este QR Code na entrada do evento
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastTickets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-dark-gray mb-6">Eventos Passados</h2>
            <div className="space-y-4">
              {pastTickets.map((ticket) => (
                <Card key={ticket.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-light-gray rounded-lg flex items-center justify-center">
                        <span className="text-xl">🎵</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-dark-gray">{ticket.event.title}</h3>
                            <p className="text-sm text-medium-gray">
                              {formatDate(ticket.event.date)} às {ticket.event.time}
                            </p>
                            <p className="text-sm text-medium-gray">
                              {ticket.event.location.city}, {ticket.event.location.state}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {getStatusLabel(ticket.status)}
                            </span>
                            <p className="text-sm text-medium-gray mt-1">
                              {ticket.quantity}x {ticket.ticketType}
                            </p>
                            <p className="font-semibold text-dark-gray">
                              {formatPrice(ticket.totalPrice)}
                            </p>
                          </div>
                        </div>
                        {ticket.checkInDate && (
                          <div className="mt-2 text-sm text-medium-gray">
                            Check-in realizado em: {formatDateTime(ticket.checkInDate)}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <FaDownload className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <FaShare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTickets.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTicketAlt className="w-10 h-10 text-medium-gray" />
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-2">Nenhum ingresso encontrado</h3>
              <p className="text-medium-gray mb-6">
                {searchTerm || statusFilter 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Você ainda não possui ingressos. Que tal descobrir alguns eventos incríveis?'
                }
              </p>
              <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
                Descobrir Eventos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
