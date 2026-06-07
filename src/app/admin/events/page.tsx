'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { storage } from '@/lib/utils/storage';
import { FaCalendarAlt, FaSearch, FaEye, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import type { Event } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const STATUS_COLORS: Record<string, string> = {
  published: '#059669',
  draft: '#d97706',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
  cancelled: 'Cancelado',
};

const CATEGORY_LABELS: Record<string, string> = {
  music: 'Música', party: 'Festa', course: 'Curso', theater: 'Teatro',
  sports: 'Esportes', conference: 'Conferência', workshop: 'Workshop', festival: 'Festival',
};

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = storage.getUserRole();
    if (role !== 'admin') { router.replace('/login'); return; }
    loadEvents();
  }, [router]);

  useEffect(() => {
    let result = events;
    if (search) result = result.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || (e.city ?? '').toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) result = result.filter(e => e.status === statusFilter);
    setFiltered(result);
  }, [search, statusFilter, events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const token = storage.getToken();
      const res = await fetch(`${API_URL}/events`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      const list: Event[] = Array.isArray(data) ? data : (data.events ?? []);
      setEvents(list);
      setFiltered(list);
    } catch {
      setError('Não foi possível carregar eventos.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const counts = {
    total: events.length,
    published: events.filter(e => e.isPublished).length,
    draft: events.filter(e => !e.isPublished).length,
  };

  return (
    <DashboardLayout userRole="admin">
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Gerenciar Eventos</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>Visualize todos os eventos da plataforma</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total', value: counts.total, color: '#003B4A' },
            { label: 'Publicados', value: counts.published, color: '#059669' },
            { label: 'Rascunhos', value: counts.draft, color: '#d97706' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.8rem' }} />
            <input
              type="text"
              placeholder="Buscar por título ou cidade..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', color: '#374151', background: '#fff' }}
          >
            <option value="">Todos os status</option>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>

        {/* Tabela */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Carregando eventos...</div>
          ) : error ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['Evento', 'Categoria', 'Data', 'Local', 'Capacidade', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Nenhum evento encontrado</td></tr>
                ) : filtered.map(event => (
                  <tr key={event.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 16px', maxWidth: 220 }}>
                      <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#374151', padding: '3px 8px', borderRadius: 20 }}>
                        {CATEGORY_LABELS[event.category] ?? event.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#374151', whiteSpace: 'nowrap' }}>
                      <FaCalendarAlt style={{ marginRight: 4, color: '#00C2A8' }} />
                      {formatDate(event.eventDate)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#374151' }}>
                      {event.locationType === 'online' ? (
                        <span style={{ color: '#0284c7' }}>Online</span>
                      ) : (
                        <span><FaMapMarkerAlt style={{ color: '#00C2A8', marginRight: 2 }} />{event.city ?? '—'}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#374151' }}>
                      <FaUsers style={{ color: '#00C2A8', marginRight: 4 }} />
                      {event.maxAttendees?.toLocaleString('pt-BR') ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${STATUS_COLORS[event.status] ?? '#6b7280'}18`, color: STATUS_COLORS[event.status] ?? '#6b7280' }}>
                        {STATUS_LABELS[event.status] ?? (event.isPublished ? 'Publicado' : 'Rascunho')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <FaEye style={{ fontSize: '0.7rem' }} /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: 12 }}>
          Exibindo {filtered.length} de {events.length} eventos
        </p>
      </div>
    </DashboardLayout>
  );
}
