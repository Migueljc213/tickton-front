'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FaPlus,
  FaChartLine,
  FaTicketAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaEye,
  FaEdit,
  FaTrash,
  FaArrowRight,
  FaUserCircle,
  FaCommentAlt,
  FaArrowUp,
} from 'react-icons/fa';
import { useEvents, useOrders, useAuth } from '@/hooks';
import { eventsService } from '@/lib/api/services';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { STATUS_COLORS, STATUS_LABELS, EVENT_STATUS } from '@/lib/utils/constants';
import type { Event, CheckInDashboardResponse } from '@/types/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
}

// ─── Mock community feed (replace with real API when available) ───────────────

const MOCK_FEED = [
  {
    id: 1,
    user: 'Ana Beatriz',
    initials: 'AB',
    event: 'Tech Summit 2025',
    comment: 'Evento incrível! A palestra de abertura foi muito inspiradora. Mal posso esperar pelo próximo.',
    time: '2h atrás',
  },
  {
    id: 2,
    user: 'Carlos Mendes',
    initials: 'CM',
    event: 'Workshop de UX Design',
    comment: 'O material disponibilizado foi excelente. Aprendi muito sobre pesquisa com usuários.',
    time: '4h atrás',
  },
  {
    id: 3,
    user: 'Fernanda Lima',
    initials: 'FL',
    event: 'Feira de Startups',
    comment: 'Consegui fazer ótimos contatos. A organização estava impecável!',
    time: '6h atrás',
  },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function KpiCard({ label, value, delta, icon, iconBg }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[#6C757D]">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-[#212529]">{value}</p>
        {delta && (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <FaArrowUp className="h-2.5 w-2.5" />
            {delta}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_PILL: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  published: { bg: 'bg-[#A7F0E0]/40', text: 'text-[#005C4B]', dot: 'bg-[#00C2A8]', label: 'Publicado' },
  active:    { bg: 'bg-[#A7F0E0]/40', text: 'text-[#005C4B]', dot: 'bg-[#00C2A8]', label: 'Ativo' },
  finished:  { bg: 'bg-gray-100',      text: 'text-[#6C757D]', dot: 'bg-[#6C757D]', label: 'Finalizado' },
  draft:     { bg: 'bg-amber-50',      text: 'text-amber-700', dot: 'bg-amber-400', label: 'Rascunho' },
  cancelled: { bg: 'bg-red-50',        text: 'text-red-600',   dot: 'bg-red-400',   label: 'Cancelado' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_PILL[status] ?? STATUS_PILL.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-base font-semibold text-[#212529]">{title}</h2>
      {action && href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-[#00C2A8] hover:text-[#009B86] transition-colors"
        >
          {action}
          <FaArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const LOGIN_PATH = '/login';
const EVENTS_PATH = '/events';

export default function OrganizerDashboard() {
  const router = useRouter();
  const { getUserId } = useAuth();
  const { events: allEvents, loading: eventsLoading, fetchEvents } = useEvents();
  const { getCheckInDashboard } = useOrders();

  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
  });
  const [eventStats, setEventStats] = useState<Record<number, CheckInDashboardResponse>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const userId = getUserId();
      if (!userId) { router.push(LOGIN_PATH); return; }

      setLoading(true);
      try {
        await fetchEvents();
        const published = allEvents.filter((e) => e.isPublished);
        setOrganizerEvents(published);

        let totalRevenue = 0;
        let totalTicketsSold = 0;
        const results = await Promise.all(
          published.map(async (event) => {
            try {
              const dash = await getCheckInDashboard(event.id);
              totalRevenue += dash.revenue;
              totalTicketsSold += dash.totalTickets;
              return { eventId: event.id, stats: dash };
            } catch { return null; }
          })
        );

        const map: Record<number, CheckInDashboardResponse> = {};
        results.forEach((r) => { if (r) map[r.eventId] = r.stats; });
        setEventStats(map);

        setStats({
          totalEvents: published.length,
          activeEvents: published.filter(
            (e) => e.status === EVENT_STATUS.ACTIVE || e.status === EVENT_STATUS.PUBLISHED
          ).length,
          totalRevenue,
          totalTicketsSold,
        });
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await eventsService.deleteEvent(eventId);
      setOrganizerEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch { alert('Erro ao excluir evento'); }
  };

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (loading || eventsLoading) {
    return (
      <DashboardLayout userRole="organizer" pageTitle="Dashboard">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00C2A8] border-t-transparent" />
            <p className="text-sm text-[#6C757D]">Carregando dashboard…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout userRole="organizer" pageTitle="Dashboard">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#212529]">
            Bom dia, João! 👋
          </h1>
          <p className="mt-1 text-sm text-[#6C757D]">
            Aqui está um resumo dos seus eventos e métricas de hoje.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#00C2A8] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00C2A8]/25 transition-all hover:bg-[#009B86] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
          <FaPlus className="h-3.5 w-3.5" />
          Criar Evento
        </button>
      </div>

      {/* ── KPI grid ─────────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Receita Líquida"
          value={formatPrice(stats.totalRevenue)}
          delta="+12% este mês"
          iconBg="bg-[#00C2A8]/10"
          icon={<FaDollarSign className="h-5 w-5 text-[#00C2A8]" />}
        />
        <KpiCard
          label="Ingressos Vendidos"
          value={stats.totalTicketsSold.toLocaleString('pt-BR')}
          delta="+8% esta semana"
          iconBg="bg-[#003B4A]/8"
          icon={<FaTicketAlt className="h-5 w-5 text-[#003B4A]" />}
        />
        <KpiCard
          label="Total de Eventos"
          value={String(stats.totalEvents)}
          iconBg="bg-[#A7F0E0]/50"
          icon={<FaCalendarAlt className="h-5 w-5 text-[#00C2A8]" />}
        />
        <KpiCard
          label="Eventos Ativos"
          value={String(stats.activeEvents)}
          iconBg="bg-[#FF7043]/10"
          icon={<FaChartLine className="h-5 w-5 text-[#FF7043]" />}
        />
      </div>

      {/* ── Two-column section: Events table + Community feed ────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Events table — takes 2/3 */}
        <div className="xl:col-span-2">
          <SectionHeader title="Eventos Recentes" action="Ver todos" href="/organizer/events" />

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {organizerEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F7F8]">
                  <FaCalendarAlt className="h-7 w-7 text-[#6C757D]" />
                </div>
                <p className="mb-1 text-sm font-semibold text-[#212529]">Nenhum evento criado ainda</p>
                <p className="mb-6 text-sm text-[#6C757D]">Crie seu primeiro evento e comece a vender ingressos.</p>
                <button className="inline-flex items-center gap-2 rounded-xl bg-[#00C2A8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#009B86] transition-colors">
                  <FaPlus className="h-3.5 w-3.5" />
                  Criar Evento
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#F5F7F8]">
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6C757D]">Evento</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6C757D]">Data</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6C757D]">Vendidos</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6C757D]">Status</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6C757D]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {organizerEvents.slice(0, 6).map((event) => {
                      const stat = eventStats[event.id];
                      return (
                        <tr key={event.id} className="group transition-colors hover:bg-[#F5F7F8]/60">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-medium text-[#212529] group-hover:text-[#00C2A8] transition-colors line-clamp-1">
                                {event.title}
                              </p>
                              <p className="mt-0.5 text-xs capitalize text-[#6C757D]">{event.category}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#6C757D]">
                            {formatDate(event.eventDate)}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-[#212529]">
                              {(stat?.totalTickets ?? 0).toLocaleString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusPill status={event.status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => router.push(`${EVENTS_PATH}/${event.id}`)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6C757D] hover:bg-[#00C2A8]/10 hover:text-[#00C2A8] transition-colors"
                                title="Visualizar"
                              >
                                <FaEye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => router.push(`/organizer/events/${event.id}/edit`)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6C757D] hover:bg-[#003B4A]/10 hover:text-[#003B4A] transition-colors"
                                title="Editar"
                              >
                                <FaEdit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6C757D] hover:bg-[#FF7043]/10 hover:text-[#FF7043] transition-colors"
                                title="Excluir"
                              >
                                <FaTrash className="h-3.5 w-3.5" />
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

        {/* Community feed — takes 1/3 */}
        <div className="xl:col-span-1">
          <SectionHeader title="Hub de Comunidade" action="Ver mural" href="/organizer/community" />

          <div className="flex flex-col gap-3">
            {MOCK_FEED.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#003B4A] text-xs font-bold text-white">
                      {post.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#212529]">{post.user}</p>
                      <p className="truncate text-xs text-[#6C757D]">{post.event}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-[#6C757D]">{post.time}</span>
                </div>
                <p className="text-sm leading-relaxed text-[#6C757D] line-clamp-2">{post.comment}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-[#6C757D]">
                  <FaCommentAlt className="h-3 w-3 text-[#00C2A8]" />
                  <span>Responder</span>
                </div>
              </div>
            ))}

            {/* Prompt card */}
            <div className="rounded-2xl border border-dashed border-[#A7F0E0] bg-[#A7F0E0]/10 p-4 text-center">
              <FaUserCircle className="mx-auto mb-2 h-6 w-6 text-[#00C2A8]" />
              <p className="text-xs font-medium text-[#005C4B]">
                Interaja com sua comunidade e fortaleça o engajamento nos seus eventos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="mt-8">
        <SectionHeader title="Ações Rápidas" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Criar Novo Evento',
              description: 'Comece do zero ou use um template pronto.',
              iconBg: 'bg-[#00C2A8]/10',
              icon: <FaPlus className="h-6 w-6 text-[#00C2A8]" />,
              cta: 'Criar agora',
              ctaStyle: 'bg-[#00C2A8] text-white hover:bg-[#009B86]',
              href: '/organizer/events/new',
            },
            {
              title: 'Gerenciar Participantes',
              description: 'Veja quem está inscrito e gerencie check-ins.',
              iconBg: 'bg-[#003B4A]/8',
              icon: <FaUserCircle className="h-6 w-6 text-[#003B4A]" />,
              cta: 'Gerenciar',
              ctaStyle: 'border border-[#003B4A] text-[#003B4A] hover:bg-[#003B4A] hover:text-white',
              href: '/organizer/participants',
            },
            {
              title: 'Relatórios e Exportação',
              description: 'Exporte dados detalhados de vendas e presença.',
              iconBg: 'bg-[#FF7043]/10',
              icon: <FaChartLine className="h-6 w-6 text-[#FF7043]" />,
              cta: 'Exportar dados',
              ctaStyle: 'border border-[#FF7043] text-[#FF7043] hover:bg-[#FF7043] hover:text-white',
              href: '/organizer/reports',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
              <div>
                <p className="font-semibold text-[#212529]">{card.title}</p>
                <p className="mt-1 text-sm text-[#6C757D]">{card.description}</p>
              </div>
              <Link
                href={card.href}
                className={`mt-auto inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${card.ctaStyle}`}
              >
                {card.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
