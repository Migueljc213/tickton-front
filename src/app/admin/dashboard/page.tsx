'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaChartLine,
  FaTicketAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaFilter,
  FaSearch,
  FaCrown,
  FaShieldAlt,
  FaBan,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

// Mock data
const mockStats = {
  totalUsers: 15420,
  activeEvents: 234,
  totalRevenue: 2847560,
  totalTicketsSold: 45680,
  newUsersThisMonth: 1234,
  eventsThisMonth: 45,
  revenueThisMonth: 456780,
  averageTicketPrice: 62.3
};

const mockUsers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    role: 'organizer',
    status: 'active',
    eventsCount: 12,
    totalRevenue: 45600,
    joinDate: '2024-03-15',
    lastLogin: '2025-01-27T10:30:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    role: 'participant',
    status: 'active',
    eventsCount: 0,
    totalRevenue: 0,
    joinDate: '2024-06-20',
    lastLogin: '2025-01-26T15:45:00Z'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    role: 'organizer',
    status: 'suspended',
    eventsCount: 8,
    totalRevenue: 23400,
    joinDate: '2024-01-10',
    lastLogin: '2025-01-20T09:15:00Z'
  }
];

const mockEvents = [
  {
    id: '1',
    title: 'Festival de Música Eletrônica 2025',
    organizer: 'Eventos SP',
    date: '2025-03-15',
    status: 'active',
    ticketsSold: 915,
    totalTickets: 1200,
    revenue: 125400,
    category: 'music'
  },
  {
    id: '2',
    title: 'Workshop de Marketing Digital',
    organizer: 'Digital Academy',
    date: '2025-02-20',
    status: 'pending_review',
    ticketsSold: 30,
    totalTickets: 50,
    revenue: 7500,
    category: 'workshop'
  },
  {
    id: '3',
    title: 'Conferência de Tecnologia',
    organizer: 'Tech Events',
    date: '2025-01-10',
    status: 'completed',
    ticketsSold: 200,
    totalTickets: 200,
    revenue: 40000,
    category: 'conference'
  }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'organizer':
        return 'Organizador';
      case 'participant':
        return 'Participante';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <FaCrown className="w-4 h-4 text-yellow-600" />;
      case 'organizer':
        return <FaShieldAlt className="w-4 h-4 text-turquoise" />;
      case 'participant':
        return <FaUsers className="w-4 h-4 text-medium-gray" />;
      default:
        return <FaUsers className="w-4 h-4 text-medium-gray" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'suspended':
        return 'Suspenso';
      case 'pending_review':
        return 'Em Análise';
      case 'completed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: FaChartLine },
    { id: 'users', label: 'Usuários', icon: FaUsers },
    { id: 'events', label: 'Eventos', icon: FaCalendarAlt },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medium-gray">Total de Usuários</p>
                <p className="text-2xl font-bold text-dark-gray">{mockStats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{mockStats.newUsersThisMonth} este mês</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm text-green-600">+{mockStats.eventsThisMonth} este mês</p>
              </div>
              <div className="w-12 h-12 bg-turquoise/10 rounded-full flex items-center justify-center">
                <FaCalendarAlt className="w-6 h-6 text-turquoise" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medium-gray">Receita Total</p>
                <p className="text-2xl font-bold text-dark-gray">{formatPrice(mockStats.totalRevenue)}</p>
                <p className="text-sm text-green-600">+{formatPrice(mockStats.revenueThisMonth)} este mês</p>
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
                <p className="text-sm text-medium-gray">Ticket médio: {formatPrice(mockStats.averageTicketPrice)}</p>
              </div>
              <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                <FaTicketAlt className="w-6 h-6 text-coral" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaChartLine className="mr-2 text-turquoise" />
              Crescimento de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-light-gray/30 rounded-lg flex items-center justify-center">
              <p className="text-medium-gray">Gráfico de crescimento seria renderizado aqui</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaDollarSign className="mr-2 text-turquoise" />
              Receita por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-light-gray/30 rounded-lg flex items-center justify-center">
              <p className="text-medium-gray">Gráfico de receita seria renderizado aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Novo evento criado', user: 'João Silva', time: '2 horas atrás', type: 'event' },
              { action: 'Usuário suspenso', user: 'Pedro Costa', time: '4 horas atrás', type: 'user' },
              { action: 'Evento aprovado', user: 'Maria Santos', time: '6 horas atrás', type: 'event' },
              { action: 'Novo organizador', user: 'Ana Lima', time: '1 dia atrás', type: 'user' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'event' ? 'bg-turquoise/10' : 'bg-coral/10'
                }`}>
                  {activity.type === 'event' ? (
                    <FaCalendarAlt className="w-4 h-4 text-turquoise" />
                  ) : (
                    <FaUsers className="w-4 h-4 text-coral" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark-gray">{activity.action}</p>
                  <p className="text-sm text-medium-gray">por {activity.user}</p>
                </div>
                <div className="text-sm text-medium-gray">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark-gray">Gerenciar Usuários</h2>
          <p className="text-medium-gray">Gerencie todos os usuários da plataforma</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white">
            <FaDownload className="mr-2" />
            Exportar
          </Button>
          <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
            <FaPlus className="mr-2" />
            Adicionar Usuário
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                className="w-full pl-10 pr-4 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
              />
            </div>
            <select className="px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent">
              <option value="">Todos os papéis</option>
              <option value="admin">Administrador</option>
              <option value="organizer">Organizador</option>
              <option value="participant">Participante</option>
            </select>
            <select className="px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent">
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
            </select>
            <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
              <FaFilter className="mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-gray/50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Usuário</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Papel</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Eventos</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Receita</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Último Login</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-light-gray/20">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-dark-gray">{user.name}</p>
                        <p className="text-sm text-medium-gray">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm">{getRoleLabel(user.role)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-dark-gray">
                      {user.eventsCount}
                    </td>
                    <td className="py-4 px-6 text-dark-gray">
                      {formatPrice(user.totalRevenue)}
                    </td>
                    <td className="py-4 px-6 text-medium-gray text-sm">
                      {formatDateTime(user.lastLogin)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="p-2">
                          <FaEye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <FaEdit className="w-4 h-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button variant="ghost" size="sm" className="p-2 text-coral hover:text-coral">
                            <FaBan className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="p-2 text-green-600 hover:text-green-600">
                            <FaCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark-gray">Gerenciar Eventos</h2>
          <p className="text-medium-gray">Gerencie todos os eventos da plataforma</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white">
            <FaDownload className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Events Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-gray/50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Evento</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Organizador</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Data</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Ingressos</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Receita</th>
                  <th className="text-left py-4 px-6 font-semibold text-dark-gray">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockEvents.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-light-gray/20">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-dark-gray">{event.title}</p>
                        <p className="text-sm text-medium-gray capitalize">{event.category}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-dark-gray">
                      {event.organizer}
                    </td>
                    <td className="py-4 px-6 text-medium-gray">
                      {formatDate(event.date)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-dark-gray">{event.ticketsSold}</p>
                        <p className="text-sm text-medium-gray">de {event.totalTickets}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-dark-gray">
                      {formatPrice(event.revenue)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="p-2">
                          <FaEye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <FaEdit className="w-4 h-4" />
                        </Button>
                        {event.status === 'pending_review' ? (
                          <Button variant="ghost" size="sm" className="p-2 text-green-600 hover:text-green-600">
                            <FaCheck className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="p-2 text-coral hover:text-coral">
                            <FaTimes className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-dark-gray">Analytics Avançado</h2>
        <p className="text-medium-gray">Análises detalhadas da plataforma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Eventos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-light-gray/30 rounded-lg flex items-center justify-center">
              <p className="text-medium-gray">Gráfico de categorias seria renderizado aqui</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Usuários por Região</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-light-gray/30 rounded-lg flex items-center justify-center">
              <p className="text-medium-gray">Mapa de usuários seria renderizado aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Painel Administrativo</h1>
            <p className="text-medium-gray">Gerencie toda a plataforma Ticketon</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-light-gray">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-turquoise text-turquoise'
                        : 'border-transparent text-medium-gray hover:text-dark-gray hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    </DashboardLayout>
  );
}
