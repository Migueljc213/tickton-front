'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { storage } from '@/lib/utils/storage';
import { useEvents, useOrders } from '@/hooks';
import { FaUsers, FaSearch, FaCheckCircle, FaClock, FaDownload, FaQrcode } from 'react-icons/fa';

export default function OrganizerParticipantsPage() {
  const router = useRouter();
  const { events, loading: eventsLoading } = useEvents();
  const { getParticipantsList } = useOrders();

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = storage.getUserId();

  // Garante que é organizador
  useEffect(() => {
    const role = storage.getUserRole();
    if (role !== 'organizer') { router.replace('/login'); return; }
  }, [router]);

  // Filtra eventos do organizador logado
  const myEvents = events.filter(e => e.organizerId === userId);

  // Carrega participantes quando seleciona evento
  useEffect(() => {
    if (!selectedEventId) return;
    loadParticipants(selectedEventId);
  }, [selectedEventId]);

  // Filtra por busca
  useEffect(() => {
    if (!search) { setFiltered(participants); return; }
    const q = search.toLowerCase();
    setFiltered(participants.filter(p =>
      p.customerName?.toLowerCase().includes(q) ||
      p.customerEmail?.toLowerCase().includes(q) ||
      p.ticketName?.toLowerCase().includes(q) ||
      p.qrCode?.toLowerCase().includes(q)
    ));
  }, [search, participants]);

  const loadParticipants = async (eventId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getParticipantsList(eventId);
      const list = Array.isArray(data) ? data : (data as any)?.participants ?? [];
      setParticipants(list);
      setFiltered(list);
    } catch {
      setError('Não foi possível carregar participantes.');
    } finally {
      setLoading(false);
    }
  };

  const checkedIn = filtered.filter(p => p.isCheckedIn).length;
  const pending = filtered.filter(p => !p.isCheckedIn).length;

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatPrice = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <DashboardLayout userRole="organizer">
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Participantes</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>Selecione um evento para ver os participantes</p>
        </div>

        {/* Seletor de evento */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Selecionar Evento</label>
          {eventsLoading ? (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Carregando eventos...</p>
          ) : myEvents.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Nenhum evento encontrado.</p>
          ) : (
            <select
              value={selectedEventId ?? ''}
              onChange={e => setSelectedEventId(Number(e.target.value) || null)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', color: '#0f172a', background: '#fff' }}
            >
              <option value="">— Escolha um evento —</option>
              {myEvents.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* Conteúdo após seleção */}
        {selectedEventId && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { label: 'Total', value: filtered.length, icon: <FaUsers />, color: '#003B4A' },
                { label: 'Check-in feito', value: checkedIn, icon: <FaCheckCircle />, color: '#059669' },
                { label: 'Aguardando', value: pending, icon: <FaClock />, color: '#d97706' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '1rem' }}>{s.icon}</div>
                  <div>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Busca */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '1rem', marginBottom: '1rem', position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou ingresso..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 44, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Tabela */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Carregando participantes...</div>
              ) : error ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                  <FaUsers style={{ fontSize: '2rem', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                  Nenhum participante encontrado
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      {['Participante', 'Ingresso', 'Valor', 'QR Code', 'Compra', 'Check-in'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', margin: 0 }}>{p.customerName ?? '—'}</p>
                          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>{p.customerEmail ?? '—'}</p>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#374151' }}>{p.ticketName ?? '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#374151' }}>{p.ticketPrice != null ? formatPrice(p.ticketPrice) : '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontFamily: 'monospace', color: '#374151' }}>
                            <FaQrcode style={{ color: '#00C2A8' }} />
                            {p.qrCode ? `${p.qrCode.slice(0, 8)}...` : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{p.purchasedAt ? formatDate(p.purchasedAt) : '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {p.isCheckedIn ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#dcfce7', padding: '3px 10px', borderRadius: 20 }}>
                              <FaCheckCircle /> Feito
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#d97706', background: '#fef3c7', padding: '3px 10px', borderRadius: 20 }}>
                              <FaClock /> Pendente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {!selectedEventId && !eventsLoading && (
          <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
            <FaUsers style={{ fontSize: '3rem', color: '#e2e8f0', display: 'block', margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Selecione um evento acima para ver a lista de participantes</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
