'use client';

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  FaRocket,
  FaSearch,
  FaCalendarAlt,
  FaTicketAlt,
  FaChartLine,
  FaArrowRight,
  FaCheckCircle,
  FaMobile,
  FaBolt,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa"
import Carousel from "@/components/ui/carousel"
import EventCard from "@/components/events/EventCard"
import type { Event as ApiEvent } from "@/types/api"
import type { Event as CardEvent } from "@/types/event"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type GeoStatus = 'idle' | 'requesting' | 'found' | 'denied' | 'error';

function adaptApiEvent(e: ApiEvent): CardEvent {
  return {
    id: String(e.id),
    title: e.title,
    description: e.description ?? '',
    date: e.eventDate,
    time: new Date(e.eventDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    location: {
      name: e.venueName || e.city || 'Local a definir',
      address: e.address ?? '',
      city: e.city ?? '',
      state: e.state ?? '',
      zipCode: e.zipcode ?? '',
      capacity: e.maxAttendees ?? 0,
    },
    organizer: { id: String(e.organizerId), name: 'Organizador', email: '', phone: '' },
    category: (e.category as CardEvent['category']) ?? 'other',
    type: 'paid',
    featured: !!(e.isPublished && e.isPublic),
    status: 'active',
    image: e.bannerUrl ?? '',
    tickets: [],
    tags: [],
    createdAt: e.createdAt ?? '',
    updatedAt: e.updatedAt ?? '',
  };
}

const CATEGORIES = [
  { icon: "🎵", label: "Música",       slug: "music",      color: "from-violet-100 to-purple-50 border-violet-200 text-violet-700 hover:border-violet-400" },
  { icon: "🎉", label: "Festas",       slug: "party",      color: "from-pink-100 to-rose-50 border-pink-200 text-pink-700 hover:border-pink-400" },
  { icon: "📚", label: "Cursos",       slug: "course",     color: "from-blue-100 to-sky-50 border-blue-200 text-blue-700 hover:border-blue-400" },
  { icon: "🎭", label: "Teatro",       slug: "theater",    color: "from-red-100 to-orange-50 border-red-200 text-red-700 hover:border-red-400" },
  { icon: "⚽", label: "Esportes",     slug: "sports",     color: "from-green-100 to-emerald-50 border-green-200 text-green-700 hover:border-green-400" },
  { icon: "🎤", label: "Conferências", slug: "conference", color: "from-yellow-100 to-amber-50 border-yellow-200 text-yellow-700 hover:border-yellow-400" },
  { icon: "🔧", label: "Workshops",   slug: "workshop",   color: "from-orange-100 to-amber-50 border-orange-200 text-orange-700 hover:border-orange-400" },
  { icon: "🎪", label: "Festivais",   slug: "festival",   color: "from-teal-100 to-cyan-50 border-teal-200 text-teal-700 hover:border-teal-400" },
]

const STATS = [
  { num: "50K+", label: "Eventos criados",       icon: "🎪" },
  { num: "2M+",  label: "Ingressos vendidos",    icon: "🎫" },
  { num: "10K+", label: "Organizadores ativos",  icon: "👥" },
  { num: "98%",  label: "Clientes satisfeitos",  icon: "⭐" },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "🔍",
    title: "Descubra",
    desc: "Encontre eventos incríveis perto de você com filtros por categoria, data e localização. Sempre algo novo para explorar.",
  },
  {
    step: "02",
    icon: "🎫",
    title: "Compre",
    desc: "Garanta seu ingresso com pagamento seguro via PIX ou cartão de crédito. Confirmação instantânea por e-mail.",
  },
  {
    step: "03",
    icon: "🎉",
    title: "Aproveite",
    desc: "Seu ingresso digital com QR Code exclusivo fica no app. Entrada rápida e sem filas no dia do evento.",
  },
]

const ORGANIZER_FEATURES = [
  { icon: "📊", title: "Dashboard em tempo real",   desc: "Acompanhe vendas, check-ins e receita ao vivo com gráficos e relatórios detalhados." },
  { icon: "🎫", title: "Lotes automáticos",          desc: "Configure virada de lote por data ou quantidade. Preços dinâmicos sem intervenção manual." },
  { icon: "📱", title: "Check-in via QR Code",       desc: "App gratuito para check-in rápido com suporte a múltiplos operadores simultâneos." },
  { icon: "💳", title: "Pagamentos seguros",         desc: "PIX, cartão e parcelamento em até 12x. Repasse automático em D+2." },
]

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; state: string } | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'pt-BR' } },
    );
    if (!r.ok) return null;
    const data = await r.json();
    const addr = data.address ?? {};
    const city  = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
    const state = addr['ISO3166-2-lvl4']?.split('-')[1] ?? addr.state_code ?? '';
    return city ? { city, state } : null;
  } catch {
    return null;
  }
}

async function fetchEventsByLocation(city: string, state: string): Promise<CardEvent[]> {
  const params = new URLSearchParams({ isPublished: 'true' });
  if (city)  params.set('city',  city);
  if (state) params.set('state', state);
  const r = await fetch(`${API_URL}/events?${params}`);
  if (!r.ok) return [];
  const data = await r.json();
  const list: ApiEvent[] = Array.isArray(data) ? data : (data.events ?? []);
  return list.map(adaptApiEvent);
}

export default function Home() {
  const [cardEvents, setCardEvents]       = useState<CardEvent[]>([]);
  const [nearbyEvents, setNearbyEvents]   = useState<CardEvent[]>([]);
  const [geoStatus, setGeoStatus]         = useState<GeoStatus>('idle');
  const [userCity, setUserCity]           = useState('');
  const [userState, setUserState]         = useState('');

  /* Carrega todos os eventos uma vez */
  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const list: ApiEvent[] = Array.isArray(data) ? data : (data.events ?? []);
        setCardEvents(list.map(adaptApiEvent));
      })
      .catch(() => null);
  }, []);

  /* Solicita geolocalização e busca eventos próximos */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (!geo) { setGeoStatus('error'); return; }
        setUserCity(geo.city);
        setUserState(geo.state);
        const nearby = await fetchEventsByLocation(geo.city, geo.state);
        setNearbyEvents(nearby);
        setGeoStatus('found');
      },
      () => setGeoStatus('denied'),
      { timeout: 8000 },
    );
  }, []);

  const featuredEvents  = cardEvents.filter(e => e.featured).slice(0, 8);
  const recentEvents    = cardEvents.slice(0, 8);
  const displayedNearby = geoStatus === 'found' ? nearbyEvents.slice(0, 8) : recentEvents;

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ========================= HERO ========================= */}
      <section className="hero-gradient min-h-[92vh] flex items-center relative overflow-hidden">
        {/* Orbs decorativos */}
        <div className="absolute top-24 left-12 w-[480px] h-[480px] bg-turquoise/10 rounded-full blur-[120px] animate-float pointer-events-none" />
        <div className="absolute bottom-16 right-8 w-[360px] h-[360px] bg-light-green/8 rounded-full blur-[100px] animate-float-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-turquoise/5 rounded-full blur-[160px] -translate-y-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 py-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* ---- Conteúdo principal ---- */}
            <div className="text-left">
              {/* Badge de destaque */}
              <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-7 animate-fade-in-up">
                <span className="w-2 h-2 bg-turquoise rounded-full animate-pulse-dot" />
                <span className="text-white/90 text-sm font-semibold">Plataforma #1 de eventos no Brasil</span>
              </div>

              <h1 className="heading-xl text-white mb-6 animate-fade-in-up animation-delay-100">
                Viva experiências
                <span className="block gradient-text">que importam</span>
              </h1>

              <p className="text-body-lg text-white/75 mb-9 max-w-xl animate-fade-in-up animation-delay-200">
                Descubra shows, festivais, cursos e muito mais perto de você.
                Compre ingressos em segundos e aproveite cada momento.
              </p>

              {/* Barra de busca glassmorphism */}
              <div className="glass rounded-2xl p-2 mb-9 animate-fade-in-up animation-delay-300 max-w-xl">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar eventos, artistas, locais..."
                      className="w-full bg-transparent pl-10 pr-4 py-3.5 text-white placeholder-white/40 text-sm outline-none"
                    />
                  </div>
                  <Link href="/events">
                    <Button className="bg-turquoise hover:bg-turquoise-600 text-white px-6 py-3.5 rounded-xl font-semibold text-sm shrink-0 h-full">
                      Buscar
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 animate-fade-in-up animation-delay-400">
                <Link href="/events">
                  <Button size="lg" className="bg-turquoise hover:bg-turquoise-600 text-white px-8 py-4 text-base font-bold rounded-xl shadow-lg shadow-turquoise/25 transition-all hover:shadow-turquoise/40 hover:-translate-y-0.5">
                    Descobrir Eventos
                    <FaArrowRight className="ml-2 text-sm" />
                  </Button>
                </Link>
                <Link href="/organizer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 px-8 py-4 text-base font-bold rounded-xl backdrop-blur-sm transition-all hover:-translate-y-0.5"
                  >
                    Criar Evento
                    <FaRocket className="ml-2 text-sm" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* ---- Cards flutuantes (visual) ---- */}
            <div className="relative hidden lg:block h-[540px]">
              {/* Card principal */}
              <div className="absolute top-10 left-6 w-72 glass-dark rounded-2xl p-5 shadow-2xl animate-float">
                <div className="w-full h-36 bg-gradient-to-br from-turquoise/40 to-dark-blue/60 rounded-xl mb-4 flex items-center justify-center text-5xl">
                  🎵
                </div>
                <h3 className="text-white font-bold text-lg leading-tight mb-1">Festival de Verão 2025</h3>
                <p className="text-white/55 text-sm mb-3">Sáb, 15 Fev · São Paulo, SP</p>
                <div className="flex justify-between items-center">
                  <span className="text-turquoise font-bold text-lg">R$ 180,00</span>
                  <span className="bg-turquoise/20 text-turquoise text-xs px-3 py-1 rounded-full font-semibold">Destaque</span>
                </div>
              </div>

              {/* Card secundário */}
              <div className="absolute bottom-16 right-0 w-64 glass-dark rounded-2xl p-4 shadow-2xl" style={{ animation: "float 5s ease-in-out 2s infinite" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coral/30 to-coral/10 flex items-center justify-center text-2xl shrink-0">
                    🎭
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm leading-tight">Show de Stand-up</h4>
                    <p className="text-white/45 text-xs mt-0.5">Qui, 20 Mar · Rio de Janeiro</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-white/55 text-xs">200 ingressos</span>
                  <span className="text-green-400 font-bold text-sm">R$ 50,00</span>
                </div>
              </div>

              {/* Badge de segurança */}
              <div className="absolute top-44 right-4 glass-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg" style={{ animation: "float 6s ease-in-out 1s infinite" }}>
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 text-base" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Compra Segura</p>
                  <p className="text-gray-500 text-xs">SSL + Garantia total</p>
                </div>
              </div>

              {/* Badge de venda rápida */}
              <div className="absolute top-4 right-8 glass-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg" style={{ animation: "float 4s ease-in-out 3s infinite" }}>
                <div className="w-9 h-9 bg-turquoise/10 rounded-full flex items-center justify-center">
                  <FaBolt className="text-turquoise text-base" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Entrega Imediata</p>
                  <p className="text-gray-500 text-xs">QR Code na hora</p>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Stats ---- */}
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 animate-fade-in-up animation-delay-600">
            {STATS.map((stat, i) => (
              <div key={i} className="glass rounded-2xl px-5 py-5 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="gradient-text font-black" style={{ fontSize: "2rem", lineHeight: 1 }}>{stat.num}</div>
                <div className="text-white/55 text-sm mt-1.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= CATEGORIAS ========================= */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {CATEGORIES.map((cat, i) => (
              <Link key={i} href={`/events?category=${cat.slug}`}>
                <div
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border bg-gradient-to-r ${cat.color} transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 text-sm font-semibold`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= EVENTOS EM DESTAQUE ========================= */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Carousel
            title="Eventos em Destaque"
            subtitle="Os eventos mais populares e bem avaliados da plataforma"
          >
            {featuredEvents.length > 0
              ? featuredEvents.map((event) => <EventCard key={event.id} event={event} />)
              : recentEvents.map((event) => <EventCard key={event.id} event={event} />)
            }
          </Carousel>
        </div>
      </section>

      {/* ========================= COMO FUNCIONA ========================= */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="section-label">Simples assim</span>
            <h2 className="heading-lg text-gray-900 mt-3 mb-4">Como funciona?</h2>
            <p className="text-body-lg text-gray-500 max-w-2xl mx-auto">
              Em apenas 3 passos simples você já está pronto para o próximo evento incrível.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative max-w-5xl mx-auto">
            {/* Linha de conexão */}
            <div className="hidden md:block absolute top-9 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-turquoise/30 via-turquoise/60 to-turquoise/30" />

            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="text-center relative group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-turquoise to-turquoise-700 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-turquoise/20 group-hover:shadow-turquoise/35 transition-shadow duration-300">
                    {item.icon}
                  </div>
                  <span className="absolute -top-4 -right-4 text-turquoise/20 font-black text-5xl leading-none select-none">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= EVENTOS PRÓXIMOS ========================= */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Carousel
            title="Próximos de Você"
            subtitle={
              geoStatus === 'requesting'
                ? 'Localizando sua cidade...'
                : geoStatus === 'found'
                  ? `Eventos em ${userCity}${userState ? `, ${userState}` : ''}`
                  : geoStatus === 'denied'
                    ? 'Permita o acesso à localização para ver eventos próximos'
                    : 'Descubra eventos incríveis na sua região'
            }
            headerRight={
              geoStatus === 'requesting' ? (
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <FaSpinner className="animate-spin text-turquoise" />
                  Detectando localização...
                </span>
              ) : geoStatus === 'found' ? (
                <span className="flex items-center gap-2 text-sm text-turquoise font-medium">
                  <FaMapMarkerAlt />
                  {userCity}{userState ? `, ${userState}` : ''}
                </span>
              ) : null
            }
          >
            {geoStatus === 'requesting' ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[280px] h-[360px] bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))
            ) : displayedNearby.length > 0 ? (
              displayedNearby.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="w-full py-10 text-center text-gray-400 text-sm">
                Nenhum evento encontrado na sua região.{' '}
                <Link href="/events" className="text-turquoise underline">Ver todos os eventos</Link>
              </div>
            )}
          </Carousel>
        </div>
      </section>

      {/* ========================= PARA ORGANIZADORES ========================= */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">

            {/* ---- Mockup do dashboard ---- */}
            <div className="relative order-2 lg:order-1">
              {/* Halo de fundo */}
              <div className="absolute inset-0 bg-turquoise/5 rounded-3xl blur-3xl scale-110 pointer-events-none" />

              <div className="relative bg-gradient-to-br from-dark-blue to-[#001C2B] rounded-3xl p-6 shadow-2xl border border-white/5">
                {/* Chrome do browser */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 bg-white/8 rounded-full h-6 ml-3 px-3 flex items-center">
                    <span className="text-white/35 text-xs">ticketon.com.br/organizer/dashboard</span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm">Painel do Organizador</h4>
                    <span className="text-turquoise text-xs bg-turquoise/15 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-turquoise rounded-full animate-pulse-dot" />
                      Ao Vivo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Vendas Hoje",      value: "R$ 4.280", trend: "↑ 23%", color: "text-turquoise" },
                      { label: "Ingressos",         value: "156",       trend: "↑ 12",  color: "text-green-400" },
                      { label: "Taxa Check-in",    value: "89%",       trend: "↑ 5%",  color: "text-yellow-400" },
                      { label: "Eventos Ativos",   value: "3",         trend: "Esta semana", color: "text-blue-400" },
                    ].map((m, i) => (
                      <div key={i} className="bg-white/6 rounded-xl p-4 border border-white/5">
                        <p className="text-white/45 text-xs mb-1">{m.label}</p>
                        <p className="text-white font-black text-xl">{m.value}</p>
                        <p className={`text-xs mt-1 ${m.color}`}>{m.trend}</p>
                      </div>
                    ))}
                  </div>

                  {/* Gráfico de barras simulado */}
                  <div className="bg-white/6 rounded-xl p-4 border border-white/5">
                    <p className="text-white/45 text-xs mb-3">Vendas — últimos 7 dias</p>
                    <div className="flex items-end gap-1.5 h-14">
                      {[35, 60, 40, 80, 65, 90, 75].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{ height: `${h}%`, background: `rgba(0,194,168,${0.4 + h / 300})` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
                        <span key={d} className="text-white/30 text-[10px] flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-5 -right-5 glass-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Setup em 5 min</p>
                  <p className="text-gray-500 text-xs">Sem taxa de adesão</p>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 glass-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">0% para gratuitos</p>
                  <p className="text-gray-500 text-xs">Taxa só em vendas pagas</p>
                </div>
              </div>
            </div>

            {/* ---- Texto e features ---- */}
            <div className="order-1 lg:order-2">
              <span className="section-label">Para organizadores</span>
              <h2 className="heading-lg text-gray-900 mt-3 mb-5 leading-tight">
                Tudo para um evento de sucesso
              </h2>
              <p className="text-body-lg text-gray-500 mb-9 leading-relaxed">
                Da criação ao check-in, nossa plataforma simplifica cada etapa com ferramentas
                profissionais que salvam horas do seu trabalho.
              </p>

              <div className="space-y-5 mb-10">
                {ORGANIZER_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="feature-icon bg-gradient-to-br from-turquoise/10 to-turquoise/5 border border-turquoise/15 text-2xl">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-turquoise transition-colors">{f.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/organizer">
                  <Button
                    size="lg"
                    className="px-8 font-bold rounded-xl hover:-translate-y-0.5 transition-all"
                    style={{ backgroundColor: '#00C2A8', color: 'white' }}
                  >
                    Criar meu evento
                    <FaArrowRight className="ml-2 text-sm" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-200 px-8 font-bold rounded-xl transition-all"
                  style={{ color: '#374151', borderColor: '#E5E7EB' }}
                >
                  Ver planos e preços
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= FEATURES RÁPIDAS ========================= */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: <FaCalendarAlt className="text-turquoise text-2xl" />, title: "Fácil de Criar", desc: "Evento online em menos de 5 minutos" },
              { icon: <FaTicketAlt className="text-turquoise text-2xl" />,   title: "Ingresso Digital", desc: "QR Code seguro, sem papel" },
              { icon: <FaMobile className="text-turquoise text-2xl" />,      title: "Check-in Rápido", desc: "App gratuito para entrada ágil" },
              { icon: <FaChartLine className="text-turquoise text-2xl" />,   title: "Analytics", desc: "Métricas em tempo real" },
            ].map((f, i) => (
              <div key={i} className="card-professional p-6 text-center hover-lift">
                <div className="w-14 h-14 rounded-2xl bg-turquoise/8 flex items-center justify-center mx-auto mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= CTA FINAL ========================= */}
      <section className="py-28 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 left-24 w-72 h-72 bg-turquoise/10 rounded-full blur-3xl" />
          <div className="absolute bottom-12 right-24 w-96 h-96 bg-light-green/8 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center glass rounded-full px-5 py-2.5 mb-8">
              <FaRocket className="text-turquoise mr-2 text-sm" />
              <span className="text-white/85 text-sm font-semibold">Comece hoje mesmo, é grátis</span>
            </div>

            <h2 className="heading-xl text-white mb-6 leading-tight">
              Pronto para o seu
              <span className="block gradient-text">próximo evento?</span>
            </h2>

            <p className="text-body-lg text-white/65 mb-10 leading-relaxed max-w-xl mx-auto">
              Junte-se a mais de 10.000 organizadores que confiam no Ticketon.
              Crie seu evento em minutos, sem taxa para eventos gratuitos.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/organizer">
                <Button
                  size="lg"
                  className="bg-turquoise hover:bg-turquoise-600 text-white px-10 py-5 text-lg font-bold rounded-xl shadow-lg shadow-turquoise/25 hover:shadow-turquoise/45 hover:-translate-y-0.5 transition-all"
                >
                  <FaRocket className="mr-3" />
                  Criar Meu Primeiro Evento
                </Button>
              </Link>
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 px-10 py-5 text-lg font-bold rounded-xl backdrop-blur-sm transition-all hover:-translate-y-0.5"
                >
                  <FaSearch className="mr-3" />
                  Explorar Eventos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
