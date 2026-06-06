'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaSearch,
  FaQrcode,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa';
import { useAuth } from '@/hooks';
import { apiClient } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface PurchasedTicket {
  id: number;
  orderId: number;
  ticketId: number;
  userId: number;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled';
  usedAt: string | null;
  createdAt: string;
}

function formatPrice(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_CONFIG = {
  valid: {
    label: 'Válido',
    icon: <FaCheckCircle className="text-green-500" />,
    badge: 'bg-green-100 text-green-700',
  },
  used: {
    label: 'Utilizado',
    icon: <FaCheckCircle className="text-gray-400" />,
    badge: 'bg-gray-100 text-gray-500',
  },
  cancelled: {
    label: 'Cancelado',
    icon: <FaTimesCircle className="text-red-400" />,
    badge: 'bg-red-100 text-red-600',
  },
};

export default function TicketsPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'valid' | 'used' | 'cancelled'>('');
  const [expandedQr, setExpandedQr] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login?redirect=/tickets');
      return;
    }

    fetch(`${API_URL}/purchased-tickets/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Falha ao carregar ingressos');
        return res.json() as Promise<PurchasedTicket[]>;
      })
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getToken, router]);

  const filtered = tickets.filter((t) => {
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchSearch =
      !search ||
      t.qrCode.toLowerCase().includes(search.toLowerCase()) ||
      String(t.orderId).includes(search) ||
      String(t.ticketId).includes(search);
    return matchStatus && matchSearch;
  });

  const validCount = tickets.filter((t) => t.status === 'valid').length;
  const usedCount = tickets.filter((t) => t.status === 'used').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">Carregando seus ingressos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Total', value: tickets.length, icon: <FaTicketAlt /> },
              { label: 'Válidos', value: validCount, icon: <FaCheckCircle /> },
              { label: 'Utilizados', value: usedCount, icon: <FaClock /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-white/60 mb-1 flex justify-center">{stat.icon}</div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código, pedido..."
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

        {/* Empty state */}
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
                : 'Tente mudar os filtros de busca.'}
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

        {/* Tickets grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ticket) => {
            const cfg = STATUS_CONFIG[ticket.status];
            const isExpanded = expandedQr === ticket.id;

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Ticket header strip */}
                <div
                  className="h-2"
                  style={{
                    backgroundColor:
                      ticket.status === 'valid'
                        ? '#00C2A8'
                        : ticket.status === 'used'
                        ? '#9CA3AF'
                        : '#EF4444',
                  }}
                />

                <div className="p-5 space-y-4">
                  {/* Status + IDs */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${cfg.badge}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">Pedido #{ticket.orderId}</span>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    {isExpanded ? (
                      <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <QRCodeSVG
                          value={ticket.qrCode}
                          size={160}
                          level="M"
                          includeMargin={false}
                          fgColor={ticket.status === 'used' ? '#9CA3AF' : '#003B4A'}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                        <FaQrcode className="text-gray-300 text-4xl" />
                      </div>
                    )}
                  </div>

                  {/* QR code text */}
                  {isExpanded && (
                    <p className="text-xs text-gray-400 font-mono text-center break-all bg-gray-50 rounded-lg p-2">
                      {ticket.qrCode}
                    </p>
                  )}

                  {/* Dates */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-gray-400" />
                      Comprado em {formatDateTime(ticket.createdAt)}
                    </div>
                    {ticket.usedAt && (
                      <div className="flex items-center gap-1.5">
                        <FaCheckCircle className="text-gray-400" />
                        Utilizado em {formatDateTime(ticket.usedAt)}
                      </div>
                    )}
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => setExpandedQr(isExpanded ? null : ticket.id)}
                    disabled={ticket.status === 'cancelled'}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      ticket.status === 'cancelled'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isExpanded
                        ? 'border-2 border-[#00C2A8] text-[#00C2A8] hover:bg-[#00C2A8] hover:text-white'
                        : 'text-white'
                    }`}
                    style={
                      ticket.status !== 'cancelled' && !isExpanded
                        ? { backgroundColor: '#00C2A8' }
                        : {}
                    }
                  >
                    <FaQrcode />
                    {isExpanded ? 'Ocultar QR Code' : 'Exibir QR Code'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
