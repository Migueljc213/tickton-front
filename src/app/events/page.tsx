'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt,
  FaUsers, FaTimes, FaSortAmountUp, FaSortAmountDown, FaMedal,
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useEvents } from '@/hooks';
import { formatDate } from '@/lib/utils/format';
import type { Event } from '@/types/api';

type SortMode = 'upcoming' | 'organizer' | 'date_asc' | 'date_desc';

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

function parseCoverImage(bannerUrl?: string | null): string | null {
  if (!bannerUrl) return null;
  try {
    const parsed = JSON.parse(bannerUrl);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
  } catch {}
  return bannerUrl;
}

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

/* Ordena eventos pelo critério selecionado */
function applySortMode(events: Event[], mode: SortMode): Event[] {
  if (mode === 'upcoming') {
    const now = Date.now();
    const upcoming = events
      .filter(e => new Date(e.eventDate).getTime() >= now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    const past = events
      .filter(e => new Date(e.eventDate).getTime() < now)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    return [...upcoming, ...past];
  }
  if (mode === 'organizer') {
    const counts: Record<number, number> = {};
    events.forEach((e) => { counts[e.organizerId] = (counts[e.organizerId] ?? 0) + 1; });
    return [...events].sort((a, b) => (counts[b.organizerId] ?? 0) - (counts[a.organizerId] ?? 0));
  }
  if (mode === 'date_asc') {
    return [...events].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }
  if (mode === 'date_desc') {
    return [...events].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }
  return events;
}

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
      </div>
      <div className="skeleton h-10 w-full rounded-xl mt-4" />
    </div>
  </div>
);

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { events, loading, error, searchEvents } = useEvents();

  const [searchTerm, setSearchTerm]         = useState(searchParams.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity]     = useState('');
  const [selectedState, setSelectedState]   = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate]     = useState('');
  const [showFilters, setShowFilters]       = useState(false);
  const [sortMode, setSortMode]             = useState<SortMode>('upcoming');

  const qParam = searchParams.get('q');

  useEffect(() => {
    if (qParam) setSearchTerm(qParam);
    searchEvents({ title: qParam || undefined, isPublished: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);

  const getCategoryIcon  = (cat: string) => CATEGORIES.find((c) => c.value === cat)?.icon  ?? '🎊';
  const getCategoryLabel = (cat: string) => CATEGORIES.find((c) => c.value === cat)?.label ?? 'Outros';

  const runSearch = (overrides: Partial<{
    title: string; category: string; city: string; state: string;
    startDate: string; endDate: string;
  }> = {}) => {
    const params = {
      title:      overrides.title      ?? searchTerm,
      category:   overrides.category   ?? selectedCategory,
      city:       overrides.city       ?? selectedCity,
      state:      overrides.state      ?? selectedState,
      startDate:  overrides.startDate  ?? selectedStartDate,
      endDate:    overrides.endDate    ?? selectedEndDate,
    };
    searchEvents({
      title:       params.title       || undefined,
      category:    params.category    || undefined,
      city:        params.city        || undefined,
      state:       params.state       || undefined,
      startDate:   params.startDate   || undefined,
      endDate:     params.endDate     || undefined,
      isPublished: true,
    });
  };

  const handleCategoryPill = (value: string) => {
    setSelectedCategory(value);
    runSearch({ category: value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedState('');
    setSelectedStartDate('');
    setSelectedEndDate('');
    setSortMode('upcoming');
    searchEvents({ isPublished: true });
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedCity
    || selectedState || selectedStartDate || selectedEndDate;

  /* Ordena localmente sem re-fetch */
  const sortedEvents = useMemo(() => applySortMode(events, sortMode), [events, sortMode]);
  const eventsCount = sortedEvents.length;

  const SORT_OPTIONS: { mode: SortMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'upcoming',  label: 'Mais próximos',  icon: <FaCalendarAlt className="text-xs" /> },
    { mode: 'organizer', label: 'Mais eventos',   icon: <FaMedal className="text-xs" /> },
    { mode: 'date_asc',  label: 'Data ↑',         icon: <FaSortAmountUp className="text-xs" /> },
    { mode: 'date_desc', label: 'Data ↓',         icon: <FaSortAmountDown className="text-xs" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-br from-dark-blue to-[#005166] py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="section-label text-turquoise">Explorar</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-2 mb-2 sm:mb-3">Descobrir Eventos</h1>
            <p className="text-white/65 text-base sm:text-lg">
              Encontre eventos incríveis na sua cidade ou explore novas experiências.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Barra de busca + filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 -mt-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar eventos, artistas, locais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`font-medium text-sm rounded-xl px-4 transition-all bg-white ${showFilters ? 'border-turquoise text-turquoise bg-turquoise/5' : 'border-gray-200 text-gray-600 hover:border-turquoise hover:text-turquoise'}`}
              >
                <FaFilter className="mr-2 text-xs" />
                Filtros
                {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-turquoise rounded-full inline-block" />}
              </Button>
              <Button
                className="bg-turquoise hover:bg-turquoise-600 text-white font-semibold text-sm rounded-xl px-6 transition-all"
                onClick={() => runSearch()}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Categoria */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Tipo de evento
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); runSearch({ category: e.target.value }); }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value.toUpperCase())}
                    onBlur={() => runSearch()}
                    placeholder="Ex: SP"
                    maxLength={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900 placeholder-gray-400 uppercase"
                  />
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    onBlur={() => runSearch()}
                    placeholder="Ex: São Paulo"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Datas */}
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      A partir de
                    </label>
                    <input
                      type="date"
                      value={selectedStartDate}
                      onChange={(e) => { setSelectedStartDate(e.target.value); runSearch({ startDate: e.target.value }); }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Até
                    </label>
                    <input
                      type="date"
                      value={selectedEndDate}
                      onChange={(e) => { setSelectedEndDate(e.target.value); runSearch({ endDate: e.target.value }); }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <FaTimes className="text-xs" />
                    Limpar todos os filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pills de categoria */}
        <div className="flex gap-2 flex-wrap mb-5">
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

        {/* Barra de resultado + ordenação */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <p className="text-sm text-gray-500">
            {loading
              ? 'Buscando eventos...'
              : `${eventsCount} evento${eventsCount !== 1 ? 's' : ''} encontrado${eventsCount !== 1 ? 's' : ''}`}
          </p>

          {/* Controles de ordenação */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium mr-1 hidden sm:block">Ordenar:</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => setSortMode(opt.mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  sortMode === opt.mode
                    ? 'bg-turquoise text-white border-turquoise shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-turquoise hover:text-turquoise'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Grid de eventos */}
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
            {sortedEvents.map((event) => {
              const coverImage = parseCoverImage(event.bannerUrl);
              const endRef = event.eventEndDate ? new Date(event.eventEndDate) : new Date(event.eventDate);
              const isEnded = endRef < new Date();
              return (
                <Card
                  key={event.id}
                  className={`group cursor-pointer border border-gray-100 shadow-sm bg-white overflow-hidden rounded-2xl transition-all duration-300 ${isEnded ? 'opacity-70' : 'hover:shadow-xl hover:-translate-y-1'}`}
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={event.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${isEnded ? 'grayscale' : 'group-hover:scale-105'}`}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${isEnded ? 'from-gray-400 to-gray-500' : (CATEGORY_GRADIENTS[event.category] ?? CATEGORY_GRADIENTS.other)} flex items-center justify-center text-5xl transition-transform duration-500 ${!isEnded && 'group-hover:scale-105'}`}>
                        {getCategoryIcon(event.category)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {isEnded ? (
                      <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        🏁 Encerrado
                      </span>
                    ) : event.isPublished ? (
                      <span className="absolute top-3 left-3 bg-white/90 text-turquoise text-[10px] font-bold px-2.5 py-1 rounded-full">
                        ✓ Publicado
                      </span>
                    ) : null}
                  </div>

                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isEnded ? 'bg-gray-100 text-gray-500' : (CATEGORY_BADGES[event.category] ?? 'bg-gray-100 text-gray-600')}`}>
                        {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
                      </span>

                      <h3 className={`font-bold text-base leading-tight line-clamp-2 transition-colors ${isEnded ? 'text-gray-500' : 'text-gray-900 group-hover:text-turquoise'}`}>
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
                        className={`w-full font-bold py-2.5 rounded-xl text-sm transition-all ${isEnded ? 'bg-gray-200 text-gray-500 hover:bg-gray-300 cursor-default' : 'bg-turquoise hover:bg-turquoise-600 text-white shadow-sm hover:shadow-md hover:shadow-turquoise/20'}`}
                        onClick={(e) => { e.stopPropagation(); router.push(`/events/${event.id}`); }}
                      >
                        {isEnded ? '🏁 Ver Evento Encerrado' : 'Ver Detalhes'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}
