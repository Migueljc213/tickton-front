import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  FaRocket, FaSearch, FaCalendarAlt, FaTicketAlt,
  FaChartLine, FaArrowRight, FaCheckCircle, FaMobile, FaBolt,
} from 'react-icons/fa';
import HomeFeaturedEvents from './HomeFeaturedEvents';
import HomeNearbyEvents from './HomeNearbyEvents';
import { adaptApiEvent, isUpcomingEvent } from '@/lib/utils/adapt-events';
import type { Event as ApiEvent } from '@/types/api';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Ticketon — Descubra e compre ingressos para eventos',
  description: 'A maior plataforma de eventos do Brasil. Compre ingressos para shows, festivais, cursos e muito mais.',
  openGraph: {
    title: 'Ticketon — Descubra e compre ingressos para eventos',
    description: 'A maior plataforma de eventos do Brasil. Compre ingressos para shows, festivais, cursos e muito mais.',
    type: 'website',
    siteName: 'Ticketon',
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetchEvents() {
  try {
    const r = await fetch(`${API_URL}/events`, { next: { revalidate: 60 } });
    if (!r.ok) return [];
    const data = await r.json();
    const list: ApiEvent[] = Array.isArray(data) ? data : (data.events ?? []);
    return list.filter(isUpcomingEvent).map(adaptApiEvent);
  } catch { return []; }
}

const CATEGORIES = [
  { icon: '🎵', label: 'Música',       slug: 'music',      color: 'from-violet-100 to-purple-50 border-violet-200 text-violet-700 hover:border-violet-400' },
  { icon: '🎉', label: 'Festas',       slug: 'party',      color: 'from-pink-100 to-rose-50 border-pink-200 text-pink-700 hover:border-pink-400' },
  { icon: '📚', label: 'Cursos',       slug: 'course',     color: 'from-blue-100 to-sky-50 border-blue-200 text-blue-700 hover:border-blue-400' },
  { icon: '🎭', label: 'Teatro',       slug: 'theater',    color: 'from-red-100 to-orange-50 border-red-200 text-red-700 hover:border-red-400' },
  { icon: '⚽', label: 'Esportes',     slug: 'sports',     color: 'from-green-100 to-emerald-50 border-green-200 text-green-700 hover:border-green-400' },
  { icon: '🎤', label: 'Conferências', slug: 'conference', color: 'from-yellow-100 to-amber-50 border-yellow-200 text-yellow-700 hover:border-yellow-400' },
  { icon: '🔧', label: 'Workshops',   slug: 'workshop',   color: 'from-orange-100 to-amber-50 border-orange-200 text-orange-700 hover:border-orange-400' },
  { icon: '🎪', label: 'Festivais',   slug: 'festival',   color: 'from-teal-100 to-cyan-50 border-teal-200 text-teal-700 hover:border-teal-400' },
];

const STATS = [
  { num: '50K+', label: 'Eventos criados',      icon: '🎪' },
  { num: '2M+',  label: 'Ingressos vendidos',   icon: '🎫' },
  { num: '10K+', label: 'Organizadores ativos', icon: '👥' },
  { num: '98%',  label: 'Clientes satisfeitos', icon: '⭐' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', title: 'Descubra', desc: 'Encontre eventos incríveis perto de você com filtros por categoria, data e localização. Sempre algo novo para explorar.' },
  { step: '02', icon: '🎫', title: 'Compre',   desc: 'Garanta seu ingresso com pagamento seguro via PIX ou cartão de crédito. Confirmação instantânea por e-mail.' },
  { step: '03', icon: '🎉', title: 'Aproveite', desc: 'Seu ingresso digital com QR Code exclusivo fica no app. Entrada rápida e sem filas no dia do evento.' },
];

const ORGANIZER_FEATURES = [
  { icon: '📊', title: 'Dashboard em tempo real',  desc: 'Acompanhe vendas, check-ins e receita ao vivo com gráficos e relatórios detalhados.' },
  { icon: '🎫', title: 'Lotes automáticos',         desc: 'Configure virada de lote por data ou quantidade. Preços dinâmicos sem intervenção manual.' },
  { icon: '📱', title: 'Check-in via QR Code',      desc: 'App gratuito para check-in rápido com suporte a múltiplos operadores simultâneos.' },
  { icon: '💳', title: 'Pagamentos seguros',        desc: 'PIX, cartão e parcelamento em até 12x. Repasse automático em D+2.' },
];

export default async function Home() {
  const events = await fetchEvents();

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ========================= HERO ========================= */}
      <section className="hero-gradient min-h-[92vh] flex items-center relative overflow-hidden">
        <div className="absolute top-24 left-12 w-[480px] h-[480px] bg-turquoise/10 rounded-full blur-[120px] animate-float pointer-events-none" />
        <div className="absolute bottom-16 right-8 w-[360px] h-[360px] bg-light-green/8 rounded-full blur-[100px] animate-float-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-turquoise/5 rounded-full blur-[160px] -translate-y-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 py-12 md:py-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">

            <div className="text-left">
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

              <div className="flex flex-wrap gap-3 animate-fade-in-up animation-delay-400">
                <Link href="/events">
                  <Button size="lg" className="bg-turquoise hover:bg-turquoise-600 text-white px-8 py-4 text-base font-bold rounded-xl shadow-lg shadow-turquoise/25 transition-all hover:shadow-turquoise/40 hover:-translate-y-0.5">
                    Descobrir Eventos
                    <FaArrowRight className="ml-2 text-sm" />
                  </Button>
                </Link>
                <Link href="/organizer">
                  <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 px-8 py-4 text-base font-bold rounded-xl backdrop-blur-sm transition-all hover:-translate-y-0.5">
                    Criar Evento
                    <FaRocket className="ml-2 text-sm" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cards flutuantes */}
            <div className="relative hidden lg:block h-[540px]">
              <div className="absolute top-10 left-6 w-72 glass-dark rounded-2xl p-5 shadow-2xl animate-float">
                <div className="w-full h-36 bg-gradient-to-br from-turquoise/40 to-dark-blue/60 rounded-xl mb-4 flex items-center justify-center text-5xl">🎵</div>
                <h3 className="text-white font-bold text-lg leading-tight mb-1">Festival de Verão 2025</h3>
                <p className="text-white/55 text-sm mb-3">Sáb, 15 Fev · São Paulo, SP</p>
                <div className="flex justify-between items-center">
                  <span className="text-turquoise font-bold text-lg">R$ 180,00</span>
                  <span className="bg-turquoise/20 text-turquoise text-xs px-3 py-1 rounded-full font-semibold">Destaque</span>
                </div>
              </div>

              <div className="absolute bottom-16 right-0 w-64 glass-dark rounded-2xl p-4 shadow-2xl" style={{ animation: 'float 5s ease-in-out 2s infinite' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coral/30 to-coral/10 flex items-center justify-center text-2xl shrink-0">🎭</div>
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

              <div className="absolute top-44 right-4 glass-white rounded-2xl px-4 py-3 hidden xl:flex items-center gap-3 shadow-lg" style={{ animation: 'float 6s ease-in-out 1s infinite' }}>
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 text-base" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Compra Segura</p>
                  <p className="text-gray-500 text-xs">SSL + Garantia total</p>
                </div>
              </div>

              <div className="absolute top-4 right-8 glass-white rounded-2xl px-4 py-3 hidden xl:flex items-center gap-3 shadow-lg" style={{ animation: 'float 4s ease-in-out 3s infinite' }}>
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

          {/* Stats */}
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-10 md:mt-20 animate-fade-in-up animation-delay-600">
            {STATS.map((stat, i) => (
              <div key={i} className="glass rounded-2xl px-5 py-5 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="gradient-text font-black" style={{ fontSize: '2rem', lineHeight: 1 }}>{stat.num}</div>
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
                <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border bg-gradient-to-r ${cat.color} transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 text-sm font-semibold`}>
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= EVENTOS EM DESTAQUE (client) ========================= */}
      <HomeFeaturedEvents initialEvents={events} />

      {/* ========================= COMO FUNCIONA ========================= */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="section-label">Simples assim</span>
            <h2 className="heading-lg text-gray-900 mt-3 mb-4">Como funciona?</h2>
            <p className="text-body-lg text-gray-500 max-w-2xl mx-auto">
              Em apenas 3 passos simples você já está pronto para o próximo evento incrível.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-9 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-turquoise/30 via-turquoise/60 to-turquoise/30" />
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="text-center relative group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-turquoise to-turquoise-700 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-turquoise/20 group-hover:shadow-turquoise/35 transition-shadow duration-300">
                    {item.icon}
                  </div>
                  <span className="absolute -top-4 -right-4 text-turquoise/20 font-black text-5xl leading-none select-none">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= EVENTOS PRÓXIMOS (client) ========================= */}
      <HomeNearbyEvents fallbackEvents={events} />

      {/* ========================= PARA ORGANIZADORES ========================= */}
      <section className="py-14 md:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">

            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-turquoise/5 rounded-3xl blur-3xl scale-110 pointer-events-none" />
              <div className="relative bg-gradient-to-br from-dark-blue to-[#001C2B] rounded-3xl p-6 shadow-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 bg-white/8 rounded-full h-6 ml-3 px-3 flex items-center">
                    <span className="text-white/35 text-xs">ticketon.com.br/organizer/dashboard</span>
                  </div>
                </div>
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
                      { label: 'Vendas Hoje',    value: 'R$ 4.280', trend: '↑ 23%',       color: 'text-turquoise' },
                      { label: 'Ingressos',       value: '156',       trend: '↑ 12',        color: 'text-green-400' },
                      { label: 'Taxa Check-in',  value: '89%',       trend: '↑ 5%',        color: 'text-yellow-400' },
                      { label: 'Eventos Ativos', value: '3',         trend: 'Esta semana', color: 'text-blue-400' },
                    ].map((m, i) => (
                      <div key={i} className="bg-white/6 rounded-xl p-4 border border-white/5">
                        <p className="text-white/45 text-xs mb-1">{m.label}</p>
                        <p className="text-white font-black text-xl">{m.value}</p>
                        <p className={`text-xs mt-1 ${m.color}`}>{m.trend}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/6 rounded-xl p-4 border border-white/5">
                    <p className="text-white/45 text-xs mb-3">Vendas — últimos 7 dias</p>
                    <div className="flex items-end gap-1.5 h-14">
                      {[35, 60, 40, 80, 65, 90, 75].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `rgba(0,194,168,${0.4 + h / 300})` }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                        <span key={d} className="text-white/30 text-[10px] flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex absolute -top-5 -right-5 glass-white rounded-2xl px-4 py-3 items-center gap-3 shadow-xl">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Setup em 5 min</p>
                  <p className="text-gray-500 text-xs">Sem taxa de adesão</p>
                </div>
              </div>
              <div className="hidden sm:flex absolute -bottom-5 -left-5 glass-white rounded-2xl px-4 py-3 items-center gap-3 shadow-xl">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">0% para gratuitos</p>
                  <p className="text-gray-500 text-xs">Taxa só em vendas pagas</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="section-label">Para organizadores</span>
              <h2 className="heading-lg text-gray-900 mt-3 mb-5 leading-tight">Tudo para um evento de sucesso</h2>
              <p className="text-body-lg text-gray-500 mb-9 leading-relaxed">
                Da criação ao check-in, nossa plataforma simplifica cada etapa com ferramentas profissionais que salvam horas do seu trabalho.
              </p>
              <div className="space-y-5 mb-10">
                {ORGANIZER_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="feature-icon bg-gradient-to-br from-turquoise/10 to-turquoise/5 border border-turquoise/15 text-2xl">{f.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-turquoise transition-colors">{f.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/organizer">
                  <Button size="lg" className="px-8 font-bold rounded-xl hover:-translate-y-0.5 transition-all" style={{ backgroundColor: '#00C2A8', color: 'white' }}>
                    Criar meu evento
                    <FaArrowRight className="ml-2 text-sm" />
                  </Button>
                </Link>
                <span className="text-sm text-gray-500 font-medium">
                  Gratuito para criar · apenas <strong className="text-gray-700">7% por ingresso vendido</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= FEATURES RÁPIDAS ========================= */}
      <section className="py-12 md:py-16 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { icon: <FaCalendarAlt className="text-turquoise text-2xl" />, title: 'Fácil de Criar',   desc: 'Evento online em menos de 5 minutos' },
              { icon: <FaTicketAlt   className="text-turquoise text-2xl" />, title: 'Ingresso Digital', desc: 'QR Code seguro, sem papel' },
              { icon: <FaMobile      className="text-turquoise text-2xl" />, title: 'Check-in Rápido',  desc: 'App gratuito para entrada ágil' },
              { icon: <FaChartLine   className="text-turquoise text-2xl" />, title: 'Analytics',        desc: 'Métricas em tempo real' },
            ].map((f, i) => (
              <div key={i} className="card-professional p-6 text-center hover-lift">
                <div className="w-14 h-14 rounded-2xl bg-turquoise/8 flex items-center justify-center mx-auto mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= CTA FINAL ========================= */}
      <section className="py-16 md:py-28 hero-gradient relative overflow-hidden">
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
              Junte-se a mais de 10.000 organizadores que confiam no Ticketon. Crie seu evento em minutos, sem taxa para eventos gratuitos.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/organizer">
                <Button size="lg" className="bg-turquoise hover:bg-turquoise-600 text-white px-10 py-5 text-lg font-bold rounded-xl shadow-lg shadow-turquoise/25 hover:shadow-turquoise/45 hover:-translate-y-0.5 transition-all">
                  <FaRocket className="mr-3" />
                  Criar Meu Primeiro Evento
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 px-10 py-5 text-lg font-bold rounded-xl backdrop-blur-sm transition-all hover:-translate-y-0.5">
                  <FaSearch className="mr-3" />
                  Explorar Eventos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
