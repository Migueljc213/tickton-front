'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  FaTicketAlt, FaCalendarAlt, FaSearch, FaQrcode,
  FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt,
  FaTimes, FaTag,
} from 'react-icons/fa';
import { useAuth } from '@/hooks';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface RichTicket {
  id: number;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled';
  purchasedAt: string;
  usedAt: string | null;
  ticket: { id: number; name: string; price: number; ticketType: string };
  event: { id: number; title: string; eventDate: string; venueName: string | null; city: string | null };
  buyer: { id: number; name: string; email: string; cpfCnpj: string | null };
}

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const fmtDt = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_CFG = {
  valid:     { label: 'Válido',     badgeBg: '#f0fdf4', badgeColor: '#15803d', strip: '#00C2A8' },
  used:      { label: 'Utilizado',  badgeBg: '#f3f4f6', badgeColor: '#6b7280', strip: '#9CA3AF' },
  cancelled: { label: 'Cancelado',  badgeBg: '#fff1f2', badgeColor: '#be123c', strip: '#EF4444' },
};

/* ─── Modal QR Code ─────────────────────────────────────────────────────── */
function QrModal({ ticket, onClose }: { ticket: RichTicket; onClose: () => void }) {
  const cfg = STATUS_CFG[ticket.status] ?? STATUS_CFG.valid;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, maxWidth: 380, width: '100%', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo colorido */}
        <div style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)', padding: '1.5rem', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {ticket.ticket.name}
              </p>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
                {ticket.event.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <FaTimes />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', opacity: 0.85 }}>
              <FaCalendarAlt style={{ fontSize: '0.7rem' }} />
              {fmtDate(ticket.event.eventDate)} · {fmtTime(ticket.event.eventDate)}
            </span>
            {ticket.event.city && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', opacity: 0.85 }}>
                <FaMapMarkerAlt style={{ fontSize: '0.7rem' }} />
                {ticket.event.venueName ? `${ticket.event.venueName}, ` : ''}{ticket.event.city}
              </span>
            )}
          </div>
        </div>

        {/* Linha tracejada */}
        <div style={{ position: 'relative', height: 0 }}>
          <div style={{ borderTop: '2px dashed #e5e7eb', margin: '0 1.5rem' }} />
          <div style={{ position: 'absolute', left: -14, top: -14, width: 28, height: 28, background: '#f8fafc', borderRadius: '50%', border: '2px solid #e5e7eb' }} />
          <div style={{ position: 'absolute', right: -14, top: -14, width: 28, height: 28, background: '#f8fafc', borderRadius: '50%', border: '2px solid #e5e7eb' }} />
        </div>

        {/* QR Code */}
        <div style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: 12, background: '#fff', border: '2px solid #f1f5f9', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <QRCodeSVG
              value={ticket.qrCode}
              size={200}
              level="M"
              includeMargin={false}
              fgColor={ticket.status === 'used' ? '#9CA3AF' : '#003B4A'}
            />
          </div>

          {/* Status badge */}
          <span style={{ padding: '4px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, background: cfg.badgeBg, color: cfg.badgeColor }}>
            {cfg.label}
          </span>

          {/* Código */}
          <p style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#9ca3af', textAlign: 'center', wordBreak: 'break-all', background: '#f8fafc', padding: '8px 12px', borderRadius: 8, width: '100%', margin: 0 }}>
            {ticket.qrCode}
          </p>

          {/* Detalhes extras */}
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>Valor</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', margin: 0 }}>{fmtBRL(ticket.ticket.price)}</p>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>Comprado em</p>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', margin: 0 }}>
                {ticket.purchasedAt ? fmtDt(ticket.purchasedAt) : '—'}
              </p>
            </div>
          </div>

          {ticket.status === 'used' && ticket.usedAt && (
            <div style={{ width: '100%', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaCheckCircle style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>Ingresso utilizado</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#16a34a' }}>em {fmtDt(ticket.usedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function TicketsPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [tickets, setTickets]   = useState<RichTicket[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'valid' | 'used' | 'cancelled'>('');
  const [qrTicket, setQrTicket] = useState<RichTicket | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/login?redirect=/tickets'); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/purchased-tickets/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar ingressos');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!loading && !error && tickets.length === 0) {
      router.push('/events');
    }
  }, [loading, error, tickets, router]);

  const filtered = tickets.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.event.title.toLowerCase().includes(q) ||
        t.ticket.name.toLowerCase().includes(q) ||
        t.qrCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    total:  tickets.length,
    valid:  tickets.filter((t) => t.status === 'valid').length,
    used:   tickets.filter((t) => t.status === 'used').length,
  };

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">Carregando seus ingressos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm space-y-4">
          <FaTimesCircle className="text-red-400 text-4xl mx-auto" />
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={() => router.push('/events')}
            className="px-5 py-2.5 text-white rounded-lg font-medium"
            style={{ backgroundColor: '#00C2A8' }}
          >
            Explorar Eventos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="text-white py-12" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold mb-1">Meus Ingressos</h1>
          <p className="text-white/70">Todos os seus ingressos em um só lugar</p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Total',      value: counts.total, icon: <FaTicketAlt /> },
              { label: 'Válidos',    value: counts.valid, icon: <FaCheckCircle /> },
              { label: 'Utilizados', value: counts.used,  icon: <FaClock /> },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-white/60 mb-1 flex justify-center">{s.icon}</div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Buscar por evento, lote ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00C2A8] text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | 'valid' | 'used' | 'cancelled')}
            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00C2A8] text-sm text-gray-700"
          >
            <option value="">Todos os status</option>
            <option value="valid">Válidos</option>
            <option value="used">Utilizados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        {/* Sem ingressos */}
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTicketAlt className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {tickets.length === 0 ? 'Nenhum ingresso encontrado' : 'Nenhum ingresso corresponde ao filtro'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {tickets.length === 0
                ? 'Compre ingressos para seus eventos favoritos e eles aparecerão aqui.'
                : 'Tente outros termos ou limpe os filtros.'}
            </p>
            {tickets.length === 0 && (
              <button
                onClick={() => router.push('/events')}
                className="px-6 py-2.5 text-white rounded-xl font-medium"
                style={{ backgroundColor: '#00C2A8' }}
              >
                Explorar Eventos
              </button>
            )}
          </div>
        )}

        {/* Grid de ingressos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ticket) => {
            const cfg = STATUS_CFG[ticket.status] ?? STATUS_CFG.valid;

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Tarja colorida de status */}
                <div style={{ height: 4, background: cfg.strip }} />

                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* Status + ID */}
                  <div className="flex items-center justify-between">
                    <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: cfg.badgeBg, color: cfg.badgeColor }}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                  </div>

                  {/* Nome do evento */}
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                      {ticket.event.title}
                    </h3>
                  </div>

                  {/* Detalhes do evento */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaCalendarAlt className="text-[#00C2A8] shrink-0" />
                      <span>{fmtDate(ticket.event.eventDate)}</span>
                    </div>
                    {(ticket.event.venueName || ticket.event.city) && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaMapMarkerAlt className="text-[#00C2A8] shrink-0" />
                        <span className="truncate">
                          {ticket.event.venueName ?? ''}{ticket.event.city ? (ticket.event.venueName ? `, ${ticket.event.city}` : ticket.event.city) : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaTag className="text-[#00C2A8] shrink-0" />
                      <span>{ticket.ticket.name} · {fmtBRL(ticket.ticket.price)}</span>
                    </div>
                  </div>

                  {/* QR placeholder */}
                  <div
                    className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-4 cursor-pointer hover:border-[#00C2A8] hover:bg-teal-50/40 transition-colors"
                    onClick={() => ticket.status !== 'cancelled' && setQrTicket(ticket)}
                  >
                    <FaQrcode className={`text-3xl ${ticket.status === 'cancelled' ? 'text-gray-200' : 'text-gray-300'}`} />
                  </div>

                  {/* Botão */}
                  <button
                    onClick={() => ticket.status !== 'cancelled' && setQrTicket(ticket)}
                    disabled={ticket.status === 'cancelled'}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors mt-auto"
                    style={
                      ticket.status === 'cancelled'
                        ? { background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }
                        : { background: '#00C2A8', color: '#fff', cursor: 'pointer' }
                    }
                  >
                    <FaQrcode />
                    {ticket.status === 'cancelled' ? 'Ingresso cancelado' : 'Ver QR Code'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal QR */}
      {qrTicket && <QrModal ticket={qrTicket} onClose={() => setQrTicket(null)} />}
    </div>
  );
}
