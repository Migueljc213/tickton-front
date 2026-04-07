'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaTimes } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useEvents } from '@/hooks';
import { formatPrice, formatDate } from '@/lib/utils/format';
import type { Event } from '@/types/api';

const CATEGORIES = [
  { value: '',           label: 'Todos',       icon: '✨' },
  { value: 'music',      label: 'Música',       icon: '🎵' },
  { value: 'party',      label: 'Festas',       icon: '🎉' },
  { value: 'course',     label: 'Cursos',       icon: '📚' },
  { value: 'theater',    label: 'Teatro',       icon: '🎭' },
  { value: 'sports',     label: 'Esportes',     icon: '⚽' },
  { value: 'conference', label: 'Conferências', icon: '🎤' },
  { value: 'workshop',   label: 'Workshops',    icon: '🔧' },
  { value: 'festival',   label: 'Festivais',    icon: '🎪' },
] as const;

const CATEGORY_GRADIENTS: Record<string, string> = {
  music:      'from-violet-500 to-purple-600',
  party:      'from-pink-500 to-rose-600',
  course:     'from-blue-500 to-sky-600',
  theater:    'from-red-500 to-orange-600',
  sports:     'from-green-500 to-emerald-600',
  conference: 'from-yellow-500 to-amber-600',
  workshop:   'from-orange-500 to-amber-600',
  festival:   'from-teal-500 to-cyan-600',
  other:      'from-turquoise to-turquoise-700',
};

const CATEGORY_BADGES: Record<string, string> = {
  music:      'bg-violet-100 text-violet-700',
  party:      'bg-pink-100 text-pink-700',
  course:     'bg-blue-100 text-blue-700',
  theater:    'bg-red-100 text-red-700',
  sports:     'bg-green-100 text-green-700',
  conference: 'bg-yellow-100 text-yellow-700',
  workshop:   'bg-orange-100 text-orange-700',
  festival:   'bg-teal-100 text-teal-700',
};

/* ---- Sub-componentes ---- */
const EventInfoItem = ({ icon: Icon, children }: { icon: IconType; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-sm text-gray-500">
    <Icon className="w-3.5 h-3.5 text-turquoise shrink-0" />
    <span className="truncate">{children}</span>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
    <div className="skeleton aspect-video w-full" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-4 w-20 rounded-full" />
      <div className="skeleton h-5 w-full rounded" />
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="space-y-2 mt-4">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>
      <div className="skeleton h-10 w-full rounded-xl mt-4" />
    </div>
  </div>
);

export default function EventsPage() {
  const router = useRouter();
  const { events, loading, error, searchEvents } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const getCategoryIcon = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.icon ?? '🎊';

  const getCategoryLabel = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.label ?? 'Outros';

  const handleSearch = async () => {
    await searchEvents({
      title:      searchTerm || undefined,
      category:   selectedCategory || undefined,
      city:       selectedCity || undefined,
      state:      selectedState || undefined,
      isPublished: true,
    });
  };

  const handleCategoryPill = (value: string) => {
    setSelectedCategory(value);
    searchEvents({
      title:       searchTerm || undefined,
      category:    value || undefined,
      city:        selectedCity || undefined,
      state:       selectedState || undefined,
      isPublished: true,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedState('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedCity || selectedState;
  const eventsCount = events.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---- Cabeçalho com gradiente ---- */}
      <div className="bg-gradient-to-br from-dark-blue to-[#005166] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="section-label text-turquoise">Explorar</span>
            <h1 className="text-4xl font-black text-white mt-2 mb-3">Descobrir Eventos</h1>
            <p className="text-white/65 text-lg">
              Encontre eventos incríveis na sua cidade ou explore novas experiências.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ---- Barra de busca ---- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 -mt-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar eventos, artistas, locais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`border-gray-200 font-medium text-sm rounded-xl px-4 transition-all ${showFilters ? 'border-turquoise text-turquoise bg-turquoise/5' : 'text-gray-600 hover:border-turquoise hover:text-turquoise'}`}
              >
                <FaFilter className="mr-2 text-xs" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-2 w-2 h-2 bg-turquoise rounded-full" />
                )}
              </Button>
              <Button
                className="bg-turquoise hover:bg-turquoise-600 text-white font-semibold text-sm rounded-xl px-6 transition-all"
                onClick={handleSearch}
                disabled={loading}
              >
                <FaSearch className="mr-2 text-xs" />
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {/* Filtros avançados */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Cidade</label>
                  <input
                    type="text"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Estado</label>
                  <input
                    type="text"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value.toUpperCase())}
                    placeholder="Ex: SP"
                    maxLength={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900 placeholder-gray-400 uppercase"
                  />
                </div>
                <div className="flex items-end">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-coral transition-colors py-2.5"
                    >
                      <FaTimes className="text-xs" />
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ---- Pills de categoria ---- */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryPill(cat.value)}
              className={`category-pill text-sm ${selectedCategory === cat.value ? 'active' : ''}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* ---- Erro ---- */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ---- Contagem ---- */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {loading
              ? 'Buscando eventos...'
              : `${eventsCount} evento${eventsCount !== 1 ? 's' : ''} encontrado${eventsCount !== 1 ? 's' : ''}`}
          </p>
          {selectedCategory && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${CATEGORY_BADGES[selectedCategory] ?? 'bg-gray-100 text-gray-600'}`}>
              {getCategoryIcon(selectedCategory)} {getCategoryLabel(selectedCategory)}
            </span>
          )}
        </div>

        {/* ---- Grid de eventos ---- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : eventsCount === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5">
              🔍
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">
              Tente buscar com outros termos ou explore diferentes categorias.
            </p>
            <Button
              onClick={clearFilters}
              className="bg-turquoise hover:bg-turquoise-600 text-white font-semibold rounded-xl px-6"
            >
              Ver todos os eventos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <Card
                key={event.id}
                className="group cursor-pointer border border-gray-100 shadow-sm hover:shadow-xl bg-white overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                {/* Imagem / placeholder */}
                <div className="relative aspect-video overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br ${CATEGORY_GRADIENTS[event.category] ?? CATEGORY_GRADIENTS.other} flex items-center justify-center text-5xl`}>
                    {getCategoryIcon(event.category)}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {event.isPublished && (
                    <span className="absolute top-3 left-3 bg-white/90 text-turquoise text-[10px] font-bold px-2.5 py-1 rounded-full">
                      ✓ Publicado
                    </span>
                  )}

                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="w-8 h-8 bg-white/90 text-gray-600 hover:text-coral rounded-full flex items-center justify-center text-xs shadow-md transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ♡
                    </button>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${CATEGORY_BADGES[event.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-turquoise transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5">
                      <EventInfoItem icon={FaCalendarAlt}>
                        {formatDate(event.eventDate)}
                      </EventInfoItem>
                      <EventInfoItem icon={FaMapMarkerAlt}>
                        {event.venueName || event.address || 'Local a definir'}
                        {event.city && `, ${event.city}`}
                        {event.state && ` - ${event.state}`}
                      </EventInfoItem>
                      {event.maxAttendees && (
                        <EventInfoItem icon={FaUsers}>
                          Até {event.maxAttendees} participantes
                        </EventInfoItem>
                      )}
                    </div>

                    <Button
                      className="w-full bg-turquoise hover:bg-turquoise-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm hover:shadow-md hover:shadow-turquoise/20 transition-all group-hover:shadow-lg"
                      onClick={(e) => { e.stopPropagation(); router.push(`/events/${event.id}`); }}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
