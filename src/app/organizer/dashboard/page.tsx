'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
} from 'react-icons/fa';
import { useEvents, useOrders, useAuth } from '@/hooks';
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

export default function OrganizerDashboard() {
  const router = useRouter();
  const { getUserId } = useAuth();
  // useEvents auto-fetches on mount — no need to call fetchEvents manually
  const { events: allEvents, loading: eventsLoading } = useEvents();
  const { getCheckInDashboard } = useOrders();

  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
  });
  const [eventStats, setEventStats] = useState<Record<number, CheckInDashboardResponse>>({});
  const [statsLoading, setStatsLoading] = useState(true);
  const processed = useRef(false);

  // Auth guard — runs once
  useEffect(() => {
    const userId = getUserId();
    if (!userId) router.push(LOGIN_PATH);
  }, [getUserId, router]);

  // Process events once the hook finishes loading (avoids infinite loop from allEvents in deps)
  useEffect(() => {
    if (eventsLoading) return;
    if (processed.current) return;
    processed.current = true;

    const run = async () => {
      setStatsLoading(true);
      const published = allEvents.filter(e => e.isPublished);
      setOrganizerEvents(published);

      let totalRevenue = 0;
      let totalTicketsSold = 0;
      const statsMap: Record<number, CheckInDashboardResponse> = {};

      await Promise.all(
        published.map(async (event) => {
          try {
            const d = await getCheckInDashboard(event.id);
            totalRevenue += d.revenue;
            totalTicketsSold += d.totalTickets;
            statsMap[event.id] = d;
          } catch {
            // ignore per-event errors
          }
        })
      );

      setEventStats(statsMap);
      setStats({
        totalEvents: published.length,
        activeEvents: published.filter(
          e => e.status === EVENT_STATUS.ACTIVE || e.status === EVENT_STATUS.PUBLISHED
        ).length,
        totalRevenue,
        totalTicketsSold,
      });
      setStatsLoading(false);
    };

    run();
  }, [eventsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewEvent   = (id: number) => router.push(`${EVENTS_PATH}/${id}`);
  const handleEditEvent   = (id: number) => router.push(`/organizer/events/${id}/edit`);
  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await eventsService.deleteEvent(id);
      setOrganizerEvents(prev => prev.filter(e => e.id !== id));
    } catch {
      alert('Erro ao excluir evento');
    }
  };

  const getStatusColor = (status: string) =>
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
  const getStatusLabel = (status: string) =>
    STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;

  const conversionRate = stats.totalEvents > 0
    ? ((stats.activeEvents / stats.totalEvents) * 100).toFixed(1)
    : '0';

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
                            <Button variant="ghost" size="sm" style={{ padding: '6px 8px' }} onClick={() => handleViewEvent(event.id)}>
                              <FaEye style={{ color: '#64748b' }} />
                            </Button>
                            <Button variant="ghost" size="sm" style={{ padding: '6px 8px' }} onClick={() => handleEditEvent(event.id)}>
                              <FaEdit style={{ color: '#64748b' }} />
                            </Button>
                            <Button variant="ghost" size="sm" style={{ padding: '6px 8px' }} onClick={() => handleDeleteEvent(event.id)}>
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
    </DashboardLayout>
  );
}
