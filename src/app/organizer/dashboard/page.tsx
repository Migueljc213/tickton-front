'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  FaPlus, 
  FaChartLine, 
  FaUsers, 
  FaTicketAlt, 
  FaCalendarAlt,
  FaDollarSign,
  FaEye,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { useEvents, useOrders, useAuth } from '@/hooks';
import { eventsService } from '@/lib/api/services';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { STATUS_COLORS, STATUS_LABELS, EVENT_STATUS } from '@/lib/utils/constants';
import type { Event, CheckInDashboardResponse } from '@/types/api';

const LOGIN_PATH = '/login';
const EVENTS_PATH = '/events';

export default function OrganizerDashboard() {
  const router = useRouter();
  const { getUserId } = useAuth();
  const { events: allEvents, loading: eventsLoading, fetchEvents } = useEvents();
  const { getCheckInDashboard } = useOrders();

  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
  });
  const [eventStats, setEventStats] = useState<{ [key: number]: CheckInDashboardResponse }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const userId = getUserId();
      if (!userId) {
        router.push(LOGIN_PATH);
        return;
      }

      setLoading(true);
      
      try {
        await fetchEvents();
        
        const publishedEvents = allEvents.filter(e => e.isPublished);
        setOrganizerEvents(publishedEvents);

        let totalRevenue = 0;
        let totalTicketsSold = 0;

        const statsPromises = publishedEvents.map(async (event) => {
          try {
            const dashboard = await getCheckInDashboard(event.id);
            totalRevenue += dashboard.revenue;
            totalTicketsSold += dashboard.totalTickets;
            return { eventId: event.id, stats: dashboard };
          } catch (err) {
            console.error(`Error loading dashboard for event ${event.id}:`, err);
            return null;
          }
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap: { [key: number]: CheckInDashboardResponse } = {};
        statsResults.forEach(result => {
          if (result) {
            statsMap[result.eventId] = result.stats;
          }
        });
        setEventStats(statsMap);

        setStats({
          totalEvents: publishedEvents.length,
          activeEvents: publishedEvents.filter(e => 
            e.status === EVENT_STATUS.ACTIVE || e.status === EVENT_STATUS.PUBLISHED
          ).length,
          totalRevenue,
          totalTicketsSold,
        });
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [getUserId, router, fetchEvents, allEvents, getCheckInDashboard]);

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
  };

  const handleViewEvent = (eventId: number) => {
    router.push(`${EVENTS_PATH}/${eventId}`);
  };

  const handleEditEvent = (eventId: number) => {
    router.push(`/organizer/events/${eventId}/edit`);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await eventsService.deleteEvent(eventId);
      setOrganizerEvents(prev => prev.filter(e => e.id !== eventId));
    } catch {
      alert('Erro ao excluir evento');
    }
  };

  if (loading || eventsLoading) {
    return (
      <DashboardLayout userRole="organizer">
        <div className="container mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-medium-gray text-lg">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const conversionRate = stats.totalEvents > 0 
    ? ((stats.activeEvents / stats.totalEvents) * 100).toFixed(1)
    : '0';

  return (
    <DashboardLayout userRole="organizer">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Dashboard</h1>
            <p className="text-medium-gray">Gerencie seus eventos e acompanhe o desempenho</p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
              <FaPlus className="mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-medium-gray">Receita Total</p>
                  <p className="text-2xl font-bold text-dark-gray">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaDollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-medium-gray">Ingressos Vendidos</p>
                  <p className="text-2xl font-bold text-dark-gray">{stats.totalTicketsSold.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-medium-gray">Eventos Ativos</p>
                  <p className="text-2xl font-bold text-dark-gray">{stats.activeEvents}</p>
                  <p className="text-sm text-medium-gray">de {stats.totalEvents} total</p>
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
                  <p className="text-sm font-medium text-medium-gray">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-dark-gray">{conversionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                  <FaChartLine className="w-6 h-6 text-coral" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Meus Eventos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {organizerEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-medium-gray mb-4">Nenhum evento encontrado</p>
                <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
                  <FaPlus className="mr-2" />
                  Criar Primeiro Evento
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-dark-gray">Evento</th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-gray">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-gray">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-gray">Ingressos</th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-gray">Receita</th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-gray">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizerEvents.map((event) => {
                      const eventStat = eventStats[event.id];
                      const ticketsSold = eventStat?.totalTickets || 0;
                      const revenue = eventStat?.revenue || 0;

                      return (
                        <tr key={event.id} className="border-b hover:bg-light-gray/20">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-dark-gray">{event.title}</p>
                              <p className="text-sm text-medium-gray capitalize">{event.category}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-medium-gray">
                            {formatDate(event.eventDate)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {getStatusLabel(event.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-dark-gray">{ticketsSold.toLocaleString()}</p>
                              <p className="text-sm text-medium-gray">ingressos vendidos</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-dark-gray">
                            {formatPrice(revenue)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-2"
                                onClick={() => handleViewEvent(event.id)}
                              >
                                <FaEye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-2"
                                onClick={() => handleEditEvent(event.id)}
                              >
                                <FaEdit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-2 text-coral hover:text-coral"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <FaTrash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlus className="w-8 h-8 text-turquoise" />
              </div>
              <h3 className="font-semibold text-dark-gray mb-2">Criar Novo Evento</h3>
              <p className="text-sm text-medium-gray mb-4">
                Comece do zero ou use um dos nossos templates
              </p>
              <Button className="w-full bg-turquoise hover:bg-turquoise/90 text-white">
                Criar Evento
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-light-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-dark-blue" />
              </div>
              <h3 className="font-semibold text-dark-gray mb-2">Gerenciar Equipe</h3>
              <p className="text-sm text-medium-gray mb-4">
                Convide colaboradores e defina permissões
              </p>
              <Button variant="outline" className="w-full border-turquoise text-turquoise hover:bg-turquoise hover:text-white">
                Gerenciar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="w-8 h-8 text-coral" />
              </div>
              <h3 className="font-semibold text-dark-gray mb-2">Relatórios</h3>
              <p className="text-sm text-medium-gray mb-4">
                Exporte dados detalhados dos seus eventos
              </p>
              <Button variant="outline" className="w-full border-coral text-coral hover:bg-coral hover:text-white">
                Exportar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
