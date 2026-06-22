'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  FaPlus,
  FaChartLine,
  FaQrcode,
  FaTicketAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserCog,
  FaUsers,
} from 'react-icons/fa';
import { useOrders, useAuth } from '@/hooks';
import { eventsService } from '@/lib/api/services';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { STATUS_COLORS, STATUS_LABELS, EVENT_STATUS } from '@/lib/utils/constants';
import type { Event, CheckInDashboardResponse } from '@/types/api';

const LOGIN_PATH  = '/login';
const EVENTS_PATH = '/events';

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #f1f5f9',
  borderRadius: '12px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  padding: '24px',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function OrganizerDashboard() {
  const router = useRouter();
  const { getUserId, getToken } = useAuth();
  const { getCheckInDashboard } = useOrders();

  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; event: Event | null; loading: boolean }>({
    open: false, event: null, loading: false,
  });
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
  });
  const [eventStats, setEventStats] = useState<Record<number, CheckInDashboardResponse>>({});
  const [eventsLoading, setEventsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const processed = useRef(false);

  // Auth guard — runs once
  useEffect(() => {
    const userId = getUserId();
    if (!userId) router.push(LOGIN_PATH);
  }, [getUserId, router]);

  // Busca os eventos do organizador logado e carrega estatísticas
  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const run = async () => {
      const token = getToken();
      const userId = getUserId();
      if (!token || !userId) return;

      // Descobre o organizerId do usuário logado
      let organizerId: number | null = null;
      try {
        const res = await fetch(`${API_URL}/organizers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const orgs: Array<{ id: number; userId: number }> = data.organizers ?? data;
          const myOrg = Array.isArray(orgs) ? orgs.find(o => o.userId === userId) : null;
          if (myOrg) organizerId = myOrg.id;
        }
      } catch { /* ignora */ }

      setEventsLoading(false);

      if (!organizerId) {
        setStatsLoading(false);
        return;
      }

      // Busca apenas os eventos deste organizador (publicados + rascunhos)
      let myEvents: Event[] = [];
      try {
        const response = await eventsService.getEventsByOrganizer(organizerId);
        myEvents = response.events;
      } catch { /* ignora */ }

      setOrganizerEvents(myEvents);

      // Carrega estatísticas apenas para eventos publicados
      let totalRevenue = 0;
      let totalTicketsSold = 0;
      const statsMap: Record<number, CheckInDashboardResponse> = {};

      await Promise.all(
        myEvents.map(async (event) => {
          try {
            const d = await getCheckInDashboard(event.id);
            totalRevenue += d.revenue;
            totalTicketsSold += d.totalTickets;
            statsMap[event.id] = d;
          } catch { /* ignora per-event */ }
        })
      );

      setEventStats(statsMap);
      setStats({
        totalEvents: myEvents.length,
        activeEvents: myEvents.filter(
          e => e.status === EVENT_STATUS.ACTIVE || e.status === EVENT_STATUS.PUBLISHED
        ).length,
        totalRevenue,
        totalTicketsSold,
      });
      setStatsLoading(false);
    };

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewEvent = (id: number) => router.push(`${EVENTS_PATH}/${id}`);
  const handleEditEvent = (id: number) => router.push(`/organizer/events/${id}/edit`);

  const handleDeleteEvent = async () => {
    if (!deleteDialog.event) return;
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await eventsService.deleteEvent(deleteDialog.event.id);
      setOrganizerEvents((prev) => prev.filter((e) => e.id !== deleteDialog.event!.id));
      toast.success('Evento excluído com sucesso!');
      setDeleteDialog({ open: false, event: null, loading: false });
    } catch {
      toast.error('Erro ao excluir evento. Tente novamente.');
      setDeleteDialog((d) => ({ ...d, loading: false }));
    }
  };

  const getStatusColor = (status: string) =>
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
  const getStatusLabel = (status: string) =>
    STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;

  if (eventsLoading || statsLoading) {
    return (
      <DashboardLayout userRole="organizer">
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, margin: '0 auto 16px',
              border: '3px solid #00C2A8', borderTopColor: 'transparent',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const PLATFORM_FEE = 0.07;
  const netRevenue = stats.totalRevenue * (1 - PLATFORM_FEE);

  const chartData = organizerEvents
    .filter((e) => eventStats[e.id])
    .map((e) => ({
      name: e.title.length > 14 ? e.title.slice(0, 13) + '…' : e.title,
      receita: parseFloat(eventStats[e.id].revenue.toFixed(2)),
      ingressos: eventStats[e.id].totalTickets,
      checkins: eventStats[e.id].checkedIn,
    }));

  const checkInsByDateData = (() => {
    const map: Record<string, number> = {};
    organizerEvents.forEach((e) => {
      (eventStats[e.id]?.checkInsByDate ?? []).forEach(({ date, count }) => {
        map[date] = (map[date] ?? 0) + count;
      });
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        checkins: count,
      }));
  })();

  const STAT_CARDS = [
    {
      label: 'Receita Bruta',
      value: formatPrice(stats.totalRevenue),
      sub: 'total arrecadado',
      icon: <FaDollarSign style={{ color: '#16a34a', fontSize: '1.25rem' }} />,
      iconBg: '#dcfce7',
    },
    {
      label: 'Receita Líquida',
      value: formatPrice(netRevenue),
      sub: 'após taxa de 7% da plataforma',
      icon: <FaDollarSign style={{ color: '#059669', fontSize: '1.25rem' }} />,
      iconBg: '#bbf7d0',
    },
    {
      label: 'Ingressos Vendidos',
      value: stats.totalTicketsSold.toLocaleString(),
      icon: <FaTicketAlt style={{ color: '#00C2A8', fontSize: '1.25rem' }} />,
      iconBg: '#f0fdfa',
    },
    {
      label: 'Eventos Ativos',
      value: stats.activeEvents,
      sub: `de ${stats.totalEvents} total`,
      icon: <FaCalendarAlt style={{ color: '#3b82f6', fontSize: '1.25rem' }} />,
      iconBg: '#eff6ff',
    },
  ];

  return (
    <DashboardLayout userRole="organizer">
      <div style={{ padding: '32px', background: '#f8fafc', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Dashboard</h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.9rem' }}>Gerencie seus eventos e acompanhe o desempenho</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="outline" style={{ borderColor: '#00C2A8', color: '#00C2A8' }} onClick={() => router.push('/organizer/profile')}>
              <FaUserCog style={{ marginRight: 8 }} /> Meu Perfil
            </Button>
            <Button variant="outline" style={{ borderColor: '#1e3a5f', color: '#1e3a5f' }} onClick={() => router.push('/organizer/checkin')}>
              <FaQrcode style={{ marginRight: 8 }} /> Portaria / Check-in
            </Button>
            <Button style={{ background: '#00C2A8', color: '#fff' }} onClick={() => router.push('/organizer/events/new')}>
              <FaPlus style={{ marginRight: 8 }} /> Novo Evento
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
          {STAT_CARDS.map((s) => (
            <div key={s.label} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</p>
                  {s.sub && <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>{s.sub}</p>}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>

            {/* Receita por evento */}
            <div style={cardStyle}>
              <h2 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: 20 }}>
                Receita por Evento (R$)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `R$${(v as number).toLocaleString('pt-BR')}`} width={72} />
                  <Tooltip
                    formatter={(value) => [`R$ ${(value as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="receita" fill="#00C2A8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ingressos vs Check-ins por evento */}
            <div style={cardStyle}>
              <h2 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: 20 }}>
                Ingressos Vendidos vs Check-ins
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="ingressos" name="Vendidos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="checkins" name="Check-ins" fill="#00C2A8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Check-ins ao longo do tempo */}
            {checkInsByDateData.length > 1 && (
              <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
                <h2 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: 20 }}>
                  Check-ins ao Longo do Tempo
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={checkInsByDateData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C2A8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00C2A8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [value, 'Check-ins']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="checkins" name="Check-ins" stroke="#00C2A8" strokeWidth={2} fill="url(#colorCheckins)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>
        )}

        {/* Events table */}
        <div style={{ ...cardStyle, padding: 0, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', margin: 0 }}>Meus Eventos</h2>
          </div>

          {organizerEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <p style={{ color: '#94a3b8', marginBottom: 16 }}>Nenhum evento encontrado</p>
              <Button style={{ background: '#00C2A8', color: '#fff' }} onClick={() => router.push('/organizer/events/new')}>
                <FaPlus style={{ marginRight: 8 }} /> Criar Primeiro Evento
              </Button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {['Evento', 'Data', 'Status', 'Ingressos', 'Receita', 'Ações'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {organizerEvents.map((event) => {
                    const es = eventStats[event.id];
                    return (
                      <tr
                        key={event.id}
                        style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', margin: 0 }}>{event.title}</p>
                          <p style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'capitalize', margin: 0 }}>{event.category}</p>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {formatDate(event.eventDate)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {getStatusLabel(event.status)}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', margin: 0 }}>{(es?.totalTickets ?? 0).toLocaleString()}</p>
                          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0 }}>vendidos</p>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {formatPrice(es?.revenue ?? 0)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <Button variant="ghost" size="sm" style={{ padding: '6px 8px' }} title="Ver evento" onClick={() => handleViewEvent(event.id)}>
                              <FaEye style={{ color: '#64748b' }} />
                            </Button>
                            <Button variant="ghost" size="sm" style={{ padding: '6px 8px' }} title="Editar" onClick={() => handleEditEvent(event.id)}>
                              <FaEdit style={{ color: '#64748b' }} />
                            </Button>
                            <Button variant="ghost" size="sm" style={{ padding: '6px 8px' }} title="Equipe de portaria" onClick={() => router.push(`/organizer/events/${event.id}/staff`)}>
                              <FaUsers style={{ color: '#00C2A8' }} />
                            </Button>
                            <Button variant="ghost" size="sm" style={{ padding: '6px 8px' }} title="Excluir" onClick={() => setDeleteDialog({ open: true, event, loading: false })}>
                              <FaTrash style={{ color: '#ef4444' }} />
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
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[
            {
              icon: <FaPlus style={{ fontSize: '1.75rem', color: '#00C2A8' }} />,
              iconBg: '#f0fdfa',
              title: 'Criar Novo Evento',
              desc: 'Comece do zero ou use um dos nossos templates',
              btn: { label: 'Criar Evento', style: { background: '#00C2A8', color: '#fff', width: '100%' } as React.CSSProperties, onClick: () => router.push('/organizer/events/new') },
            },
            {
              icon: <FaQrcode style={{ fontSize: '1.75rem', color: '#1e3a5f' }} />,
              iconBg: '#eff6ff',
              title: 'Check-in / Portaria',
              desc: 'Valide ingressos via QR code na entrada do evento',
              btn: { label: 'Abrir Portaria', variant: 'outline' as const, style: { borderColor: '#00C2A8', color: '#00C2A8', width: '100%' } as React.CSSProperties, onClick: () => router.push('/organizer/checkin') },
            },
            {
              icon: <FaChartLine style={{ fontSize: '1.75rem', color: '#f59e0b' }} />,
              iconBg: '#fefce8',
              title: 'Perfil & Dados Bancários',
              desc: 'Atualize seu perfil e dados para receber pagamentos',
              btn: { label: 'Editar Perfil', variant: 'outline' as const, style: { borderColor: '#f59e0b', color: '#f59e0b', width: '100%' } as React.CSSProperties, onClick: () => router.push('/organizer/profile') },
            },
          ].map((item) => (
            <div key={item.title} style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {item.icon}
              </div>
              <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8, fontSize: '0.95rem' }}>{item.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: 16, lineHeight: 1.5 }}>{item.desc}</p>
              <Button variant={item.btn.variant} style={item.btn.style} onClick={item.btn.onClick}>
                {item.btn.label}
              </Button>
            </div>
          ))}
        </div>

      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((d) => ({ ...d, open }))}
        title="Excluir evento"
        description={`Tem certeza que deseja excluir "${deleteDialog.event?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir"
        variant="destructive"
        loading={deleteDialog.loading}
        onConfirm={handleDeleteEvent}
      />
    </DashboardLayout>
  );
}
