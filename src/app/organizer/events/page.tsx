'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '@/hooks';
import { eventsService, ticketsService } from '@/lib/api/services';
import { formatDate } from '@/lib/utils/format';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils/constants';
import type { Event } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type TicketCounts = { sold: number; remaining: number };

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { getToken, getUserId } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [ticketCounts, setTicketCounts] = useState<Record<number, TicketCounts>>({});
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; event: Event | null; loading: boolean }>({
    open: false, event: null, loading: false,
  });
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const run = async () => {
      const token = getToken();
      const userId = getUserId();
      if (!token || !userId) { router.push('/login'); return; }

      let organizerId: number | null = null;
      try {
        const res = await fetch(`${API_URL}/organizers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const orgs: Array<{ id: number; userId: number }> = data.organizers ?? data;
          const myOrg = Array.isArray(orgs) ? orgs.find((o) => o.userId === userId) : null;
          if (myOrg) organizerId = myOrg.id;
        }
      } catch { /* ignora */ }

      if (!organizerId) { setLoading(false); return; }

      let myEvents: Event[] = [];
      try {
        const response = await eventsService.getEventsByOrganizer(organizerId);
        myEvents = response.events;
      } catch { /* ignora */ }

      setEvents(myEvents);

      const countsMap: Record<number, TicketCounts> = {};
      await Promise.all(
        myEvents.map(async (event) => {
          try {
            const { tickets } = await ticketsService.getTicketsByEventId(event.id);
            const sold = tickets.reduce((sum, t) => sum + t.quantitySold, 0);
            const remaining = tickets.reduce(
              (sum, t) => sum + Math.max(t.quantityAvailable - t.quantitySold, 0),
              0,
            );
            countsMap[event.id] = { sold, remaining };
          } catch { /* ignora por evento */ }
        }),
      );
      setTicketCounts(countsMap);
      setLoading(false);
    };

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteEvent = async () => {
    if (!deleteDialog.event) return;
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await eventsService.deleteEvent(deleteDialog.event.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteDialog.event!.id));
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

  if (loading) {
    return (
      <DashboardLayout userRole="organizer">
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid #00C2A8', borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="organizer">
      <div style={{ padding: '32px', background: '#f8fafc', minHeight: '100vh' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Eventos</h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.9rem' }}>Gerencie os eventos que você criou</p>
          </div>
          <Button style={{ background: '#00C2A8', color: '#fff' }} onClick={() => router.push('/organizer/events/new')}>
            <FaPlus style={{ marginRight: 8 }} /> Cadastrar Evento
          </Button>
        </div>

        <div style={{
          background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <FaCalendarAlt style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: 12 }} />
              <p style={{ color: '#94a3b8', marginBottom: 16 }}>Nenhum evento cadastrado ainda</p>
              <Button style={{ background: '#00C2A8', color: '#fff' }} onClick={() => router.push('/organizer/events/new')}>
                <FaPlus style={{ marginRight: 8 }} /> Cadastrar Primeiro Evento
              </Button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {['Nome', 'Data', 'Status', 'Ingressos vendidos', 'Ingressos disponíveis', 'Ações'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const counts = ticketCounts[event.id];
                    return (
                      <tr
                        key={event.id}
                        style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
                        <td style={{ padding: '14px 16px', color: '#0f172a', fontSize: '0.875rem', fontWeight: 600 }}>
                          {(counts?.sold ?? 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#0f172a', fontSize: '0.875rem', fontWeight: 600 }}>
                          {(counts?.remaining ?? 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              title="Editar evento"
                              onClick={() => router.push(`/organizer/events/${event.id}/edit`)}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 32, height: 32, borderRadius: 8, border: 'none',
                                background: 'transparent', cursor: 'pointer', color: '#64748b',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              title="Apagar evento"
                              onClick={() => setDeleteDialog({ open: true, event, loading: false })}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 32, height: 32, borderRadius: 8, border: 'none',
                                background: 'transparent', cursor: 'pointer', color: '#ef4444',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <FaTrash />
                            </button>
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
