'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaHeart,
  FaShare,
  FaArrowLeft,
  FaTicketAlt,
  FaShieldAlt,
  FaMinus,
  FaPlus,
  FaCheckCircle,
} from 'react-icons/fa';
import { useEvent, useTickets } from '@/hooks';
import { formatPrice, formatLongDate, formatTime } from '@/lib/utils/format';
import type { Ticket } from '@/types/api';

const CHECKOUT_PATH = '/checkout';
const EVENTS_PATH   = '/events';

const CATEGORY_GRADIENT: Record<string, string> = {
  music:      'from-violet-500 to-purple-600',
  party:      'from-pink-500 to-rose-600',
  course:     'from-blue-500 to-sky-600',
  theater:    'from-red-500 to-orange-600',
  sports:     'from-green-500 to-emerald-600',
  conference: 'from-yellow-500 to-amber-600',
  workshop:   'from-orange-500 to-amber-600',
  exhibition: 'from-indigo-500 to-violet-600',
  festival:   'from-teal-500 to-cyan-600',
  other:      'from-turquoise to-turquoise-700',
};

const CATEGORY_ICON: Record<string, string> = {
  music: '🎵', party: '🎉', course: '📚', theater: '🎭',
  sports: '⚽', conference: '🎤', workshop: '🔧',
  exhibition: '🖼️', festival: '🎪', other: '🎊',
};

const CATEGORY_LABEL: Record<string, string> = {
  music: 'Música', party: 'Festa', course: 'Curso', theater: 'Teatro',
  sports: 'Esportes', conference: 'Conferência', workshop: 'Workshop',
  exhibition: 'Exposição', festival: 'Festival', other: 'Outros',
};

/* ---- Skeleton ---- */
function EventSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="skeleton h-[50vh] w-full" />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-full rounded" />
            </div>
          </div>
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const params  = useParams();
  const router  = useRouter();
  const eventId = params?.id ? parseInt(params.id as string, 10) : null;

  const { event, loading: eventLoading, error: eventError } = useEvent(eventId);
  const { tickets, loading: ticketsLoading, fetchTickets }  = useTickets(eventId ?? undefined);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (eventId) fetchTickets();
  }, [eventId, fetchTickets]);

  const getAvailable = (ticket: Ticket) => ticket.quantityAvailable - ticket.quantitySold;
  const calculateTotal = () => selectedTicket ? Number(selectedTicket.price) * ticketQuantity : 0;

  const handleBuy = () => {
    if (!selectedTicket || !eventId) return;
    router.push(`${CHECKOUT_PATH}?eventId=${eventId}&ticketId=${selectedTicket.id}&quantity=${ticketQuantity}`);
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketQuantity(1);
  };

  if (eventLoading) return <EventSkeleton />;

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm max-w-sm mx-4">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Evento não encontrado</h2>
          <p className="text-gray-500 text-sm mb-6">O evento que você procura não existe ou foi removido.</p>
          <Button
            onClick={() => router.push(EVENTS_PATH)}
            className="bg-turquoise hover:bg-turquoise-600 text-white rounded-xl font-semibold"
          >
            Ver todos os eventos
          </Button>
        </div>
      </div>
    );
  }

  const gradient   = CATEGORY_GRADIENT[event.category] ?? CATEGORY_GRADIENT.other;
  const catIcon    = CATEGORY_ICON[event.category] ?? '🎊';
  const catLabel   = CATEGORY_LABEL[event.category] ?? 'Outros';
  const hasTickets = tickets.length > 0;
  const venueInfo  = event.venueName || event.address || 'Local a definir';
  const locationInfo = [venueInfo, event.city, event.state].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========================= HERO DO EVENTO ========================= */}
      <div className="relative h-[52vh] min-h-[320px] overflow-hidden">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-[120px] opacity-40 blur-sm select-none">{catIcon}</span>
          </div>
        )}

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Botão voltar */}
        <button
          onClick={() => router.push(EVENTS_PATH)}
          className="absolute top-6 left-6 glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-white text-sm font-medium hover:bg-white/20 transition-all"
        >
          <FaArrowLeft className="text-xs" />
          Voltar
        </button>

        {/* Ações (like / share) */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${liked ? 'bg-coral text-white shadow-lg shadow-coral/30' : 'glass text-white hover:bg-white/20'}`}
          >
            <FaHeart className="text-sm" />
          </button>
          <button className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <FaShare className="text-sm" />
          </button>
        </div>

        {/* Infos sobrepondo o banner */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-white/70 text-xs font-semibold bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                {catIcon} {catLabel}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-lg line-clamp-2">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ========================= CORPO ========================= */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ---- Coluna principal ---- */}
          <div className="lg:col-span-2 space-y-6">

            {/* Informações rápidas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-turquoise/10 rounded-xl flex items-center justify-center shrink-0">
                    <FaCalendarAlt className="text-turquoise" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Data</p>
                    <p className="font-bold text-gray-900">{formatLongDate(event.eventDate)}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <FaClock className="text-xs" />
                      {formatTime(event.eventDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-turquoise/10 rounded-xl flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt className="text-turquoise" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Local</p>
                    <p className="font-bold text-gray-900 leading-tight">{venueInfo}</p>
                    {(event.city || event.state) && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {[event.city, event.state].filter(Boolean).join(' - ')}
                      </p>
                    )}
                  </div>
                </div>

                {event.maxAttendees && (
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-turquoise/10 rounded-xl flex items-center justify-center shrink-0">
                      <FaUsers className="text-turquoise" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Capacidade</p>
                      <p className="font-bold text-gray-900">Até {event.maxAttendees} pessoas</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <FaShieldAlt className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Segurança</p>
                    <p className="font-bold text-gray-900 text-sm">Compra 100% protegida</p>
                    <p className="text-xs text-gray-500">SSL + garantia de reembolso</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sobre o evento */}
            {event.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-turquoise rounded-full" />
                  Sobre o Evento
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                  {event.description}
                </p>
              </div>
            )}
          </div>

          {/* ---- Sidebar de ingressos ---- */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FaTicketAlt className="text-turquoise" />
                Selecionar Ingresso
              </h2>

              {ticketsLoading ? (
                <div className="space-y-3">
                  <div className="skeleton h-20 rounded-xl" />
                  <div className="skeleton h-20 rounded-xl" />
                </div>
              ) : !hasTickets ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎫</div>
                  <p className="text-gray-500 text-sm">Nenhum ingresso disponível no momento</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-5">
                    {tickets.map((ticket) => {
                      const available  = getAvailable(ticket);
                      const soldOut    = available <= 0 || !ticket.isActive;
                      const isSelected = selectedTicket?.id === ticket.id;
                      const isLow      = available > 0 && available <= 10;

                      return (
                        <div
                          key={ticket.id}
                          onClick={() => !soldOut && handleSelectTicket(ticket)}
                          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            soldOut
                              ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              : isSelected
                                ? 'border-turquoise bg-turquoise/5 shadow-sm shadow-turquoise/10'
                                : 'border-gray-200 hover:border-turquoise/50 hover:bg-gray-50'
                          }`}
                        >
                          {isSelected && (
                            <FaCheckCircle className="absolute top-3 right-3 text-turquoise text-sm" />
                          )}
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{ticket.name}</p>
                              {ticket.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ticket.description}</p>
                              )}
                              <p className={`text-xs font-medium mt-1.5 ${soldOut ? 'text-red-400' : isLow ? 'text-orange-500' : 'text-gray-400'}`}>
                                {soldOut ? '❌ Esgotado' : isLow ? `⚡ Últimas ${available} unidades` : `✓ ${available} disponíveis`}
                              </p>
                            </div>
                            <span className="text-turquoise font-black text-base shrink-0 ml-3">
                              {formatPrice(Number(ticket.price))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Seletor de quantidade + total */}
                  {selectedTicket && (
                    <div className="border-t border-gray-100 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Quantidade</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                            disabled={ticketQuantity <= 1}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-turquoise hover:text-turquoise disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-8 text-center font-bold text-gray-900">{ticketQuantity}</span>
                          <button
                            onClick={() => setTicketQuantity(Math.min(getAvailable(selectedTicket), ticketQuantity + 1))}
                            disabled={ticketQuantity >= getAvailable(selectedTicket)}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-turquoise hover:text-turquoise disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Resumo */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{ticketQuantity}x {selectedTicket.name}</span>
                          <span className="text-gray-700 font-medium">{formatPrice(Number(selectedTicket.price) * ticketQuantity)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-black text-xl text-turquoise">{formatPrice(calculateTotal())}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleBuy}
                        className="w-full bg-turquoise hover:bg-turquoise-600 text-white font-bold py-4 rounded-xl shadow-md shadow-turquoise/20 hover:shadow-lg hover:shadow-turquoise/30 transition-all text-base"
                      >
                        <FaTicketAlt className="mr-2" />
                        Comprar Ingressos
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <FaShieldAlt className="text-green-500" />
                        Compra 100% segura com garantia de reembolso
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
