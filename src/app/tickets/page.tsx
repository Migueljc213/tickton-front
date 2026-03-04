'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FaTicketAlt, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaQrcode, 
  FaShare,
  FaCheck,
} from 'react-icons/fa';
import { useOrders, useAuth } from '@/hooks';
import { eventsService } from '@/lib/api/services';
import { formatPrice, formatLongDate, formatDateTime } from '@/lib/utils/format';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils/constants';
import type { Order, OrderItem, Event } from '@/types/api';

const LOGIN_PATH = '/login';
const EVENTS_PATH = '/events';

interface TicketWithMetadata {
  item: OrderItem;
  order: Order;
  event: Event;
}

export default function TicketsPage() {
  const router = useRouter();
  const { getUserId } = useAuth();
  const { getOrdersByUserId, loading } = useOrders();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[][]>([]);
  const [events, setEvents] = useState<{ [key: number]: Event }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showQRCode, setShowQRCode] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      const userId = getUserId();
      if (!userId) {
        router.push(LOGIN_PATH);
        return;
      }

      try {
        const response = await getOrdersByUserId(userId);
        setOrders(response.orders);
        setOrderItems(response.items || []);
        
        const eventPromises = response.orders.map(order => 
          eventsService.getEventById(order.eventId)
        );
        const eventResults = await Promise.all(eventPromises);
        const eventsMap: { [key: number]: Event } = {};
        eventResults.forEach(event => {
          eventsMap[event.id] = event;
        });
        setEvents(eventsMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar ingressos');
      }
    };

    loadOrders();
  }, [getUserId, getOrdersByUserId, router]);

  const allTickets: TicketWithMetadata[] = orderItems.flatMap((items, orderIndex) => {
    const order = orders[orderIndex];
    const event = order ? events[order.eventId] : null;
    if (!order || !event) return [];

    return items.map(item => ({
      item,
      order,
      event,
    }));
  });

  const filteredTickets = allTickets.filter(({ event, item }) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.city?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = !statusFilter || 
      (statusFilter === 'confirmed' && !item.isCheckedIn) ||
      (statusFilter === 'used' && item.isCheckedIn);
    return matchesSearch && matchesStatus;
  });

  const upcomingTickets = filteredTickets.filter(({ event, item }) => 
    !item.isCheckedIn && new Date(event.eventDate) > new Date()
  );

  const pastTickets = filteredTickets.filter(({ event, item }) => 
    item.isCheckedIn || new Date(event.eventDate) <= new Date()
  );

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  const getStatusColor = (isCheckedIn: boolean) => {
    return isCheckedIn
      ? STATUS_COLORS.used
      : STATUS_COLORS.confirmed;
  };

  const getStatusLabel = (isCheckedIn: boolean) => {
    return isCheckedIn ? STATUS_LABELS.used : STATUS_LABELS.confirmed;
  };

  const handleToggleQRCode = (itemId: number) => {
    setShowQRCode(showQRCode === itemId ? null : itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-medium-gray text-lg">Carregando ingressos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-gray/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push(EVENTS_PATH)}>
              Voltar para Eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasTickets = filteredTickets.length > 0;
  const hasUpcoming = upcomingTickets.length > 0;
  const hasPast = pastTickets.length > 0;

  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Meus Ingressos</h1>
            <p className="text-medium-gray">Gerencie todos os seus ingressos em um só lugar</p>
          </div>
        </div>

        <Card className="border-0 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
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
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-medium-gray">Total de Ingressos</p>
                  <p className="text-2xl font-bold text-dark-gray">{allTickets.length}</p>
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
                  <p className="text-2xl font-bold text-dark-gray">{formatPrice(totalSpent)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaTicketAlt className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasUpcoming && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">Próximos Eventos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map(({ item, event }) => (
                <Card key={item.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-light-gray rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl">🎵</span>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-medium-gray">
                          <div className="flex items-center">
                            <FaCalendarAlt className="w-4 h-4 mr-1" />
                            {formatLongDate(event.eventDate)}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.isCheckedIn)}`}>
                        {getStatusLabel(item.isCheckedIn)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-medium-gray">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                        {event.city || 'Local a definir'}
                        {event.state && `, ${event.state}`}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-medium-gray">
                            {item.quantity} ingresso{item.quantity > 1 ? 's' : ''}
                          </p>
                          <p className="font-semibold text-dark-gray">
                            {formatPrice(Number(item.totalPrice))}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleQRCode(item.id)}
                            className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white"
                          >
                            <FaQrcode className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FaShare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {showQRCode === item.id && (
                        <div className="p-4 bg-white border border-light-gray rounded-lg">
                          <div className="text-center">
                            <div className="w-24 h-24 bg-light-gray rounded-lg mx-auto mb-3 flex items-center justify-center">
                              <FaQrcode className="w-12 h-12 text-medium-gray" />
                            </div>
                            <p className="text-xs text-medium-gray font-mono mb-2">{item.qrCode}</p>
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

        {hasPast && (
          <div>
            <h2 className="text-2xl font-bold text-dark-gray mb-6">Eventos Passados</h2>
            <div className="space-y-4">
              {pastTickets.map(({ item, event }) => (
                <Card key={item.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-light-gray rounded-lg flex items-center justify-center">
                        <span className="text-xl">🎵</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-dark-gray">{event.title}</h3>
                            <p className="text-sm text-medium-gray">
                              {formatLongDate(event.eventDate)}
                            </p>
                            <p className="text-sm text-medium-gray">
                              {event.city || 'Local a definir'}
                              {event.state && `, ${event.state}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.isCheckedIn)}`}>
                              {getStatusLabel(item.isCheckedIn)}
                            </span>
                            <p className="text-sm text-medium-gray mt-1">
                              {item.quantity} ingresso{item.quantity > 1 ? 's' : ''}
                            </p>
                            <p className="font-semibold text-dark-gray">
                              {formatPrice(Number(item.totalPrice))}
                            </p>
                          </div>
                        </div>
                        {item.checkedInAt && (
                          <div className="mt-2 text-sm text-medium-gray">
                            Check-in realizado em: {formatDateTime(item.checkedInAt)}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
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

        {!hasTickets && (
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
              <Button 
                className="bg-turquoise hover:bg-turquoise/90 text-white"
                onClick={() => router.push(EVENTS_PATH)}
              >
                Descobrir Eventos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
