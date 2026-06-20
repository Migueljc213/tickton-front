'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks';
import { storage } from '@/lib/utils/storage';
import { eventsService } from '@/lib/api/services';
import type { Event } from '@/types/api';
import {
  FaChartBar, FaUsers, FaCheckCircle, FaClock, FaDollarSign,
  FaTicketAlt, FaStar, FaCommentAlt, FaLink, FaCopy, FaCheck,
  FaVenusMars, FaUtensils, FaMapMarkerAlt,
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3002';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analytics {
  revenue: number;
  totalOrders: number;
  ticketsSold: number;
  checkedIn: number;
  noShow: number;
  checkInRate: number;
  noShowRate: number;
  dailySales: Array<{ date: string; count: number; revenue: number }>;
  hourlyCheckin: Array<{ hour: number; count: number }>;
  ticketBreakdown: Array<{
    ticketId: number; name: string; ticketType: string;
    price: number; sold: number; checkedIn: number;
  }>;
  demographics: {
    genderBreakdown: Array<{ gender: string; count: number }>;
    ageGroups: Array<{ group: string; count: number }>;
    neighborhoodBreakdown: Array<{ neighborhood: string; count: number }>;
    totalWithData: number;
  };
  consumption: {
    items: Array<{ itemName: string; category: string; totalQuantity: number; totalRevenue: number }>;
    byCategory: Array<{ category: string; totalQuantity: number; totalRevenue: number }>;
    totalRevenue: number;
    totalItems: number;
  };
}

interface FeedbackSummary {
  totalFeedbacks: number;
  avgNps: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  avgSound: number | null;
  avgBathroom: number | null;
  avgBarWait: number | null;
  avgSecurity: number | null;
  recentComments: Array<{ comment: string; npsScore: number; createdAt: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtPct = (v: number) => `${v}%`;

const GENDER_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  nao_binario: 'Não-binário',
  outro: 'Outro',
  nao_informado: 'Não informado',
};

const CATEGORY_LABELS: Record<string, string> = {
  bebida: 'Bebidas',
  comida: 'Comidas',
  outro: 'Outros',
};

const GENDER_COLORS = ['#00C2A8', '#003B4A', '#60a5fa', '#f59e0b', '#a78bfa'];
const CATEGORY_COLORS: Record<string, string> = {
  bebida: '#00C2A8',
  comida: '#f59e0b',
  outro: '#a78bfa',
};

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400 text-sm">Sem dados</span>;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <FaStar key={s} className={s <= Math.round(value) ? 'text-amber-400' : 'text-gray-200'} />
      ))}
      <span className="text-sm font-bold text-gray-700 ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

function BarChart({ data, labelKey, valueKey, color = '#00C2A8' }: {
  data: Record<string, number | string>[];
  labelKey: string;
  valueKey: string;
  color?: string;
}) {
  const max = Math.max(...data.map(d => Number(d[valueKey])), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => {
        const pct = (Number(d[valueKey]) / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div
              className="w-full rounded-t transition-all"
              style={{ height: `${pct}%`, background: color, minHeight: pct > 0 ? 4 : 0 }}
              title={`${d[labelKey]}: ${d[valueKey]}`}
            />
            <span className="text-[10px] text-gray-400 truncate w-full text-center">
              {d[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function NpsGauge({ score }: { score: number }) {
  const color = score >= 50 ? '#22c55e' : score >= 0 ? '#eab308' : '#ef4444';
  const label = score >= 75 ? 'Excelente' : score >= 50 ? 'Bom' : score >= 0 ? 'Regular' : 'Crítico';
  return (
    <div className="text-center py-4">
      <div
        className="inline-flex items-center justify-center w-28 h-28 rounded-full text-white text-3xl font-black"
        style={{ background: color, boxShadow: `0 0 32px ${color}55` }}
      >
        {score}
      </div>
      <p className="mt-2 font-bold text-gray-700">{label}</p>
      <p className="text-xs text-gray-400">NPS Score</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const { getToken, getUserId } = useAuth();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [feedback, setFeedback] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const role = storage.getUserRole();
    if (role !== 'organizer') { router.replace('/login'); return; }

    const token = getToken();
    const userId = getUserId();
    if (!token || !userId) return;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/organizers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const orgs: Array<{ id: number; userId: number }> = data.organizers ?? data;
        const myOrg = Array.isArray(orgs) ? orgs.find(o => o.userId === userId) : null;
        if (!myOrg) return;
        const response = await eventsService.getEventsByOrganizer(myOrg.id);
        const evts = response.events;
        setMyEvents(evts);
        if (evts.length > 0) {
          setSelectedEventId(evts[evts.length - 1].id);
        }
      } catch { /* ignora */ } finally {
        setEventsLoading(false);
      }
    })();
  }, [router, getToken, getUserId]);

  useEffect(() => {
    if (!selectedEventId) return;
    loadData(selectedEventId);
  }, [selectedEventId]);

  const loadData = async (eventId: number) => {
    const token = storage.getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [anaRes, fbRes] = await Promise.all([
        fetch(`${API_URL}/analytics/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/event-feedbacks/event/${eventId}/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!anaRes.ok) throw new Error('Erro ao carregar analytics');
      setAnalytics(await anaRes.json());
      if (fbRes.ok) setFeedback(await fbRes.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const feedbackLink = selectedEventId
    ? `${FRONTEND_URL}/feedback/${selectedEventId}`
    : '';

  const copyLink = () => {
    if (!feedbackLink) return;
    navigator.clipboard.writeText(feedbackLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedEvent = myEvents.find(e => e.id === selectedEventId);

  const hourlyLabels = analytics?.hourlyCheckin.map(h => ({
    label: `${h.hour}h`,
    value: h.count,
  })) ?? [];

  const dailyLabels = analytics?.dailySales.slice(-14).map(d => ({
    label: new Date(d.date.slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    value: d.count,
  })) ?? [];

  return (
    <DashboardLayout userRole="organizer">
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="text-white py-8" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaChartBar className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Analytics do Evento</h1>
                <p className="text-white/70 text-sm">Entenda o que aconteceu no seu evento</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl py-8 space-y-6">
          {/* Seletor de evento */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <label className="label-form">Selecionar Evento</label>
            {eventsLoading ? (
              <p className="text-gray-400 text-sm">Carregando seus eventos...</p>
            ) : myEvents.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum evento encontrado.</p>
            ) : (
              <select
                className="input-form"
                value={selectedEventId ?? ''}
                onChange={e => { setSelectedEventId(Number(e.target.value) || null); setAnalytics(null); setFeedback(null); }}
              >
                <option value="">— Escolha um evento —</option>
                {myEvents.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
              </div>
            </div>
          )}

          {analytics && !loading && (
            <>
              {/* ── Link de Feedback ────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FaLink className="text-[#00C2A8]" />
                  <h2 className="font-bold text-gray-800">Link de Avaliação Pós-Evento</h2>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Compartilhe este link com seus participantes após o evento para coletar feedback.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={feedbackLink}
                    className="input-form flex-1 font-mono text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2.5 text-white font-semibold rounded-xl flex items-center gap-2 transition-all hover:opacity-90"
                    style={{ backgroundColor: copied ? '#22c55e' : '#00C2A8' }}
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* ── Métricas principais ─────────────────────────────────────── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: <FaDollarSign />, color: '#003B4A',
                    label: 'Receita Total', value: fmtBRL(analytics.revenue),
                    sub: `${analytics.totalOrders} pedido(s) pago(s)`,
                  },
                  {
                    icon: <FaTicketAlt />, color: '#00C2A8',
                    label: 'Ingressos Vendidos', value: String(analytics.ticketsSold),
                    sub: `${analytics.ticketBreakdown.length} lote(s)`,
                  },
                  {
                    icon: <FaCheckCircle />, color: '#22c55e',
                    label: 'Check-in Feito', value: `${analytics.checkedIn}`,
                    sub: `${fmtPct(analytics.checkInRate)} dos vendidos`,
                  },
                  {
                    icon: <FaClock />, color: '#f59e0b',
                    label: 'Não Compareceram', value: String(analytics.noShow),
                    sub: `${fmtPct(analytics.noShowRate)} de no-show`,
                  },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ background: card.color }}
                      >
                        {card.icon}
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Taxa de check-in (barra de progresso) ───────────────────── */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUsers className="text-[#00C2A8]" /> Como foi a chegada do público?
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'Compareceram (check-in)', value: analytics.checkedIn, pct: analytics.checkInRate, color: '#00C2A8' },
                    { label: 'Não compareceram (no-show)', value: analytics.noShow, pct: analytics.noShowRate, color: '#f59e0b' },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{row.label}</span>
                        <span className="font-bold text-gray-900">{row.value} ({fmtPct(row.pct)})</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${row.pct}%`, background: row.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* ── Curva horária de chegada ──────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaClock className="text-[#00C2A8]" /> A que horas o público chegou?
                  </h2>
                  {hourlyLabels.length > 0 ? (
                    <BarChart data={hourlyLabels} labelKey="label" valueKey="value" color="#00C2A8" />
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">Sem dados de check-in ainda</p>
                  )}
                </div>

                {/* ── Vendas por dia ────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaDollarSign className="text-[#00C2A8]" /> Quando as pessoas compraram?
                  </h2>
                  {dailyLabels.length > 0 ? (
                    <BarChart data={dailyLabels} labelKey="label" valueKey="value" color="#003B4A" />
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">Sem vendas registradas</p>
                  )}
                </div>
              </div>

              {/* ── Breakdown por lote ────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaTicketAlt className="text-[#00C2A8]" /> Desempenho por lote de ingresso
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                        {['Lote', 'Tipo', 'Valor', 'Vendidos', 'Check-in', 'Taxa'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.ticketBreakdown.map(t => (
                        <tr key={t.ticketId} className="border-t border-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-900">{t.name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              t.ticketType === 'free'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {t.ticketType === 'free' ? 'Gratuito' : 'Pago'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {t.ticketType === 'free' ? '—' : fmtBRL(t.price)}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">{t.sold}</td>
                          <td className="px-4 py-3 text-green-600 font-bold">{t.checkedIn}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full">
                                <div
                                  className="h-full bg-[#00C2A8] rounded-full"
                                  style={{ width: `${t.sold > 0 ? Math.round((t.checkedIn / t.sold) * 100) : 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-10 text-right">
                                {t.sold > 0 ? Math.round((t.checkedIn / t.sold) * 100) : 0}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Dados Demográficos ──────────────────────────────────────── */}
              {analytics.demographics && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <FaVenusMars className="text-[#00C2A8]" /> Dados Demográficos
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    {analytics.demographics.totalWithData > 0
                      ? `${analytics.demographics.totalWithData} comprador(es) forneceram dados`
                      : 'Nenhum dado demográfico coletado ainda'}
                  </p>

                  {analytics.demographics.totalWithData === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">
                      Os dados aparecerão quando compradores preencherem os campos opcionais no checkout.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Gênero */}
                      {analytics.demographics.genderBreakdown.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-3">Gênero</p>
                          <div className="space-y-2">
                            {analytics.demographics.genderBreakdown.map((g, i) => {
                              const total = analytics.demographics.genderBreakdown.reduce((s, x) => s + x.count, 0);
                              const pct = total > 0 ? Math.round((g.count / total) * 100) : 0;
                              return (
                                <div key={g.gender}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600">{GENDER_LABELS[g.gender] ?? g.gender}</span>
                                    <span className="font-bold text-gray-800">{g.count} ({pct}%)</span>
                                  </div>
                                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{ width: `${pct}%`, background: GENDER_COLORS[i % GENDER_COLORS.length] }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Faixa etária */}
                      {analytics.demographics.ageGroups.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-3">Faixa Etária</p>
                          <BarChart
                            data={analytics.demographics.ageGroups.map(g => ({ label: g.group, value: g.count }))}
                            labelKey="label"
                            valueKey="value"
                            color="#003B4A"
                          />
                        </div>
                      )}

                      {/* Bairros */}
                      {analytics.demographics.neighborhoodBreakdown.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-[#00C2A8]" /> Top Bairros
                          </p>
                          <div className="space-y-1.5">
                            {analytics.demographics.neighborhoodBreakdown.slice(0, 6).map((n) => {
                              const total = analytics.demographics.neighborhoodBreakdown.reduce((s, x) => s + x.count, 0);
                              const pct = total > 0 ? Math.round((n.count / total) * 100) : 0;
                              return (
                                <div key={n.neighborhood} className="flex items-center justify-between gap-2 text-xs">
                                  <span className="text-gray-600 truncate flex-1">{n.neighborhood}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-[#00C2A8] rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="font-bold text-gray-700 w-6 text-right">{n.count}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Dados de Consumo ────────────────────────────────────────── */}
              {analytics.consumption && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <FaUtensils className="text-[#00C2A8]" /> Dados de Consumo
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    Registre vendas de bar/comida via <span className="font-mono text-gray-500">POST /event-consumption-records</span>
                  </p>

                  {analytics.consumption.totalItems === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">
                      Nenhum registro de consumo para este evento. Registre vendas de bar/alimentação para visualizar aqui.
                    </p>
                  ) : (
                    <>
                      {/* Totais */}
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Itens Vendidos</p>
                          <p className="text-2xl font-black text-gray-900">{analytics.consumption.totalItems}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Receita Total</p>
                          <p className="text-2xl font-black text-[#00C2A8]">{fmtBRL(analytics.consumption.totalRevenue)}</p>
                        </div>
                      </div>

                      {/* Por categoria */}
                      {analytics.consumption.byCategory.length > 0 && (
                        <div className="mb-5">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Por Categoria</p>
                          <div className="space-y-2">
                            {analytics.consumption.byCategory.map((cat) => {
                              const totalQty = analytics.consumption.byCategory.reduce((s, x) => s + x.totalQuantity, 0);
                              const pct = totalQty > 0 ? Math.round((cat.totalQuantity / totalQty) * 100) : 0;
                              const color = CATEGORY_COLORS[cat.category] ?? '#64748b';
                              return (
                                <div key={cat.category}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-gray-700">{CATEGORY_LABELS[cat.category] ?? cat.category}</span>
                                    <span className="text-gray-500">{cat.totalQuantity} itens · {fmtBRL(cat.totalRevenue)}</span>
                                  </div>
                                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Itens mais vendidos */}
                      {analytics.consumption.items.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-3">Itens Mais Vendidos</p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                                  {['Item', 'Categoria', 'Qtd', 'Receita'].map(h => (
                                    <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {analytics.consumption.items.slice(0, 10).map((item, i) => (
                                  <tr key={i} className="border-t border-gray-50">
                                    <td className="px-3 py-2 font-medium text-gray-900">{item.itemName}</td>
                                    <td className="px-3 py-2">
                                      <span
                                        className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                                        style={{ background: CATEGORY_COLORS[item.category] ?? '#64748b' }}
                                      >
                                        {CATEGORY_LABELS[item.category] ?? item.category}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 font-bold text-gray-800">{item.totalQuantity}</td>
                                    <td className="px-3 py-2 text-[#00C2A8] font-semibold">{fmtBRL(item.totalRevenue)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── Feedback / NPS ───────────────────────────────────────────── */}
              {feedback && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* NPS Gauge */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center">
                      <h2 className="font-bold text-gray-800 mb-2 text-center">
                        O que seu público vai falar?
                      </h2>
                      <p className="text-xs text-gray-400 mb-2 text-center">
                        {feedback.totalFeedbacks} avaliação(ões) recebida(s)
                      </p>
                      {feedback.totalFeedbacks === 0 ? (
                        <p className="text-gray-400 text-sm py-8 text-center">Ainda sem avaliações</p>
                      ) : (
                        <>
                          <NpsGauge score={feedback.npsScore} />
                          <div className="w-full grid grid-cols-3 gap-2 text-center text-xs mt-2">
                            <div className="bg-green-50 rounded-xl p-2">
                              <p className="font-black text-green-600 text-lg">{feedback.promoters}</p>
                              <p className="text-gray-500">Promotores</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2">
                              <p className="font-black text-gray-500 text-lg">{feedback.passives}</p>
                              <p className="text-gray-500">Neutros</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-2">
                              <p className="font-black text-red-500 text-lg">{feedback.detractors}</p>
                              <p className="text-gray-500">Detratores</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Avaliações de infraestrutura */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 col-span-1 lg:col-span-2">
                      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaStar className="text-amber-400" /> Como o público avaliou a estrutura?
                      </h2>
                      <div className="space-y-4">
                        {[
                          { label: 'Qualidade do Som', value: feedback.avgSound },
                          { label: 'Limpeza dos Banheiros', value: feedback.avgBathroom },
                          { label: 'Tempo de Fila no Bar', value: feedback.avgBarWait },
                          { label: 'Segurança', value: feedback.avgSecurity },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-600 w-44 flex-shrink-0">{item.label}</span>
                            <div className="flex-1">
                              {item.value !== null ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full">
                                    <div
                                      className="h-full rounded-full bg-amber-400"
                                      style={{ width: `${((item.value) / 5) * 100}%` }}
                                    />
                                  </div>
                                  <StarRating value={item.value} />
                                </div>
                              ) : (
                                <span className="text-gray-300 text-sm">Sem dados</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comentários recentes */}
                  {feedback.recentComments.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCommentAlt className="text-[#00C2A8]" /> O que o público disse (comentários abertos)
                      </h2>
                      <div className="space-y-3">
                        {feedback.recentComments.map((c, i) => (
                          <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: c.npsScore >= 9 ? '#22c55e' : c.npsScore >= 7 ? '#eab308' : '#ef4444' }}
                            >
                              {c.npsScore}
                            </div>
                            <div>
                              <p className="text-sm text-gray-700">{c.comment}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Estado vazio */}
          {!selectedEventId && !eventsLoading && (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
              <FaChartBar className="text-5xl text-gray-200 mx-auto mb-4" />
              <h3 className="text-gray-500 font-semibold mb-1">Selecione um evento acima</h3>
              <p className="text-gray-400 text-sm">Os dados de vendas, check-in e feedback aparecerão aqui</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
