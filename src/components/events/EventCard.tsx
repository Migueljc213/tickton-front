'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaHeart,
  FaShare,
  FaTicketAlt,
  FaClock,
} from 'react-icons/fa';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  showDistance?: boolean;
  distance?: number;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; gradient: string; badge: string }> = {
  music:      { label: 'Música',       icon: '🎵', gradient: 'from-violet-500 to-purple-600',  badge: 'bg-violet-100 text-violet-700' },
  party:      { label: 'Festa',        icon: '🎉', gradient: 'from-pink-500 to-rose-600',      badge: 'bg-pink-100 text-pink-700' },
  course:     { label: 'Curso',        icon: '📚', gradient: 'from-blue-500 to-sky-600',       badge: 'bg-blue-100 text-blue-700' },
  theater:    { label: 'Teatro',       icon: '🎭', gradient: 'from-red-500 to-orange-600',     badge: 'bg-red-100 text-red-700' },
  sports:     { label: 'Esportes',     icon: '⚽', gradient: 'from-green-500 to-emerald-600',  badge: 'bg-green-100 text-green-700' },
  conference: { label: 'Conferência',  icon: '🎤', gradient: 'from-yellow-500 to-amber-600',   badge: 'bg-yellow-100 text-yellow-700' },
  workshop:   { label: 'Workshop',     icon: '🔧', gradient: 'from-orange-500 to-amber-600',   badge: 'bg-orange-100 text-orange-700' },
  exhibition: { label: 'Exposição',    icon: '🖼️', gradient: 'from-indigo-500 to-violet-600',  badge: 'bg-indigo-100 text-indigo-700' },
  festival:   { label: 'Festival',     icon: '🎪', gradient: 'from-teal-500 to-cyan-600',      badge: 'bg-teal-100 text-teal-700' },
  other:      { label: 'Outros',       icon: '🎊', gradient: 'from-turquoise to-turquoise-700', badge: 'bg-turquoise-50 text-turquoise-700' },
};

export default function EventCard({ event, showDistance = false, distance }: EventCardProps) {
  const cat = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.other;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const getAvailable = () =>
    event.tickets.reduce((total, t) => total + (t.quantity - t.sold), 0);

  const getMinPrice = () => {
    const prices = event.tickets.filter((t) => t.isActive).map((t) => t.price);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const available = getAvailable();
  const minPrice = getMinPrice();
  const isFree = event.type === 'free';
  const hasTicketInfo = event.tickets.length > 0;
  const isLowStock = available > 0 && available <= 10;

  return (
    <Card className="w-80 flex-shrink-0 overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer rounded-2xl bg-white hover:-translate-y-1">
      <Link href={`/events/${event.id}`} className="block">
        {/* ---- Imagem / Placeholder ---- */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
              <span className="text-6xl drop-shadow-lg">{cat.icon}</span>
            </div>
          )}

          {/* Overlay gradiente no bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex gap-2">
            {event.featured && (
              <span className="bg-turquoise text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                ⭐ Destaque
              </span>
            )}
            {isLowStock && (
              <span className="bg-coral text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                🔥 Poucos ingressos
              </span>
            )}
          </div>

          {/* Distância */}
          {showDistance && distance && (
            <div className="absolute top-3 right-3">
              <span className="glass-white text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                📍 {distance} km
              </span>
            </div>
          )}

          {/* Ações flutuantes (heart / share) */}
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              className="w-8 h-8 bg-white/95 hover:bg-white text-gray-600 hover:text-coral rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
              onClick={(e) => e.preventDefault()}
            >
              <FaHeart className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-8 h-8 bg-white/95 hover:bg-white text-gray-600 hover:text-turquoise rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
              onClick={(e) => e.preventDefault()}
            >
              <FaShare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preço no canto inferior */}
          <div className="absolute bottom-3 right-3">
            <span className={`text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-md ${isFree ? 'bg-green-500' : 'bg-dark-blue/90 backdrop-blur-sm'}`}>
              {!hasTicketInfo ? 'Ver preços' : isFree ? 'Gratuito' : `A partir de ${formatPrice(minPrice)}`}
            </span>
          </div>
        </div>

        {/* ---- Conteúdo ---- */}
        <CardContent className="p-5">
          {/* Badge de categoria */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cat.badge}`}>
              {cat.icon} {cat.label}
            </span>
            {available <= 0 && (
              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                Esgotado
              </span>
            )}
          </div>

          {/* Título */}
          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 mb-3 group-hover:text-turquoise transition-colors duration-200">
            {event.title}
          </h3>

          {/* Infos */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaCalendarAlt className="text-turquoise w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{formatDate(event.date)}</span>
              <span className="text-gray-300">·</span>
              <FaClock className="text-turquoise w-3 h-3 shrink-0" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaMapMarkerAlt className="text-turquoise w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{event.location.name}, {event.location.city}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaUsers className="text-turquoise w-3.5 h-3.5 shrink-0" />
              <span>{available > 0 ? `${available} ingressos disponíveis` : 'Sem ingressos'}</span>
            </div>
          </div>

          {/* Organizador + botão */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              por <span className="font-semibold text-gray-600">{event.organizer.name}</span>
            </p>
            <Button
              size="sm"
              className="bg-turquoise hover:bg-turquoise-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-md hover:shadow-turquoise/20 transition-all flex items-center gap-1.5"
            >
              <FaTicketAlt className="w-3 h-3" />
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
