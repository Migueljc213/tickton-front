'use client';

import { useState } from 'react';
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
  FaFilter,
  FaDownload
} from 'react-icons/fa';

// Mock data
const mockEvents = [
  {
    id: '1',
    title: 'Festival de Música Eletrônica 2025',
    date: '2025-03-15',
    status: 'active',
    ticketsSold: 915,
    totalTickets: 1200,
    revenue: 125400,
    views: 2540,
    category: 'music'
  },
  {
    id: '2',
    title: 'Workshop de Marketing Digital',
    date: '2025-02-20',
    status: 'active',
    ticketsSold: 30,
    totalTickets: 50,
    revenue: 7500,
    views: 450,
    category: 'workshop'
  },
  {
    id: '3',
    title: 'Conferência de Tecnologia',
    date: '2025-01-10',
    status: 'completed',
    ticketsSold: 200,
    totalTickets: 200,
    revenue: 40000,
    views: 1200,
    category: 'conference'
  }
];

const mockStats = {
  totalEvents: 12,
  activeEvents: 2,
  totalRevenue: 285900,
  totalTicketsSold: 2150,
  averageTicketPrice: 133,
  conversionRate: 3.2
};

export default function OrganizerDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [events, setEvents] = useState(mockEvents);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'completed':
        return 'Finalizado';
      case 'cancelled':
        return 'Cancelado';
      case 'draft':
        return 'Rascunho';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout userRole="organizer">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Dashboard</h1>
            <p className="text-medium-gray">Gerencie seus eventos e acompanhe o desempenho</p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white">
              <FaFilter className="mr-2" />
              Filtros
            </Button>
            <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
              <FaPlus className="mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-medium-gray">Receita Total</p>
                  <p className="text-2xl font-bold text-dark-gray">{formatPrice(mockStats.totalRevenue)}</p>
                  <p className="text-sm text-green-600">+12% vs mês anterior</p>
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
                  <p className="text-2xl font-bold text-dark-gray">{mockStats.totalTicketsSold.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+8% vs mês anterior</p>
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
                  <p className="text-2xl font-bold text-dark-gray">{mockStats.activeEvents}</p>
                  <p className="text-sm text-medium-gray">de {mockStats.totalEvents} total</p>
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
                  <p className="text-2xl font-bold text-dark-gray">{mockStats.conversionRate}%</p>
                  <p className="text-sm text-green-600">+0.3% vs mês anterior</p>
                </div>
                <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                  <FaChartLine className="w-6 h-6 text-coral" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaChartLine className="mr-2 text-turquoise" />
                Vendas dos Últimos 30 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-light-gray/30 rounded-lg flex items-center justify-center">
                <p className="text-medium-gray">Gráfico de vendas seria renderizado aqui</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaUsers className="mr-2 text-turquoise" />
                Público por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-light-gray/30 rounded-lg flex items-center justify-center">
                <p className="text-medium-gray">Gráfico de categorias seria renderizado aqui</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Meus Eventos</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <FaDownload className="mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Evento</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Ingressos</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Receita</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Visualizações</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-light-gray/20">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-dark-gray">{event.title}</p>
                          <p className="text-sm text-medium-gray capitalize">{event.category}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-medium-gray">
                        {formatDate(event.date)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusLabel(event.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-dark-gray">{event.ticketsSold.toLocaleString()}</p>
                          <p className="text-sm text-medium-gray">de {event.totalTickets.toLocaleString()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-dark-gray">
                        {formatPrice(event.revenue)}
                      </td>
                      <td className="py-4 px-4 text-medium-gray">
                        {event.views.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="p-2">
                            <FaEye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2">
                            <FaEdit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2 text-coral hover:text-coral">
                            <FaTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
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
                <FaDownload className="w-8 h-8 text-coral" />
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
