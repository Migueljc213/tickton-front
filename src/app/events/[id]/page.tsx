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
  FaChevronLeft,
  FaChevronRight,
  FaUserTie,
  FaExternalLinkAlt,
  FaCheckDouble,
  FaShoppingBag,
  FaShoppingCart,
  FaTimes,
} from 'react-icons/fa';
import { useEvent, useTickets } from '@/hooks';
import { useAuth } from '@/hooks';
import { storage } from '@/lib/utils/storage';
import { apiClient } from '@/lib/api';
import LoginModal from '@/components/auth/LoginModal';
import { formatPrice, formatLongDate, formatTime } from '@/lib/utils/format';
import type { Ticket } from '@/types/api';
import EventWall from '@/components/events/EventWall';
import EventMapCard from '@/components/events/EventMapCard';

const CHECKOUT_PATH = '/checkout';
const EVENTS_PATH   = '/events';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Event Store Section ──────────────────────────────────────────────────────
interface EventProduct {
  id: number; name: string; description: string | null;
  price: number; stock: number; imageUrl: string | null;
  category: string; organizerId: number;
}
interface EventStoreOrder {
  customerName: string; customerEmail: string;
  customerPhone?: string; quantity: number; notes?: string;
}

function EventStoreSection({ eventId }: { eventId: number }) {
  const [products, setProducts]   = useState<EventProduct[]>([]);
  const [loading, setLoading]     = useState(true);
  const [buyTarget, setBuyTarget] = useState<EventProduct | null>(null);
  const [order, setOrder]         = useState<EventStoreOrder>({ customerName: '', customerEmail: '', quantity: 1 });
  const [saving, setSaving]       = useState(false);
  const [done, setDone]           = useState(false);
  const [buyError, setBuyError]   = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/organizer-store/by-event/${eventId}`)
      .then(r => r.ok ? r.json() : [])
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (!loading && products.length === 0) return null;

  const total = buyTarget
    ? (Number(buyTarget.price) * order.quantity).toFixed(2).replace('.', ',')
    : '0,00';

  const submitBuy = async () => {
    if (!order.customerName.trim() || !order.customerEmail.trim()) {
      setBuyError('Nome e e-mail são obrigatórios'); return;
    }
    const token = localStorage.getItem('token');
    if (!token) { setBuyError('Faça login para comprar'); return; }
    setSaving(true); setBuyError(null);
    try {
      const res = await fetch(`${API_URL}/organizer-store/products/${buyTarget!.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...order, quantity: order.quantity }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Erro ao realizar pedido'); }
      setDone(true);
      setProducts(prev => prev.map(p => p.id === buyTarget!.id ? { ...p, stock: p.stock - order.quantity } : p));
    } catch (e) { setBuyError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setSaving(false); }
  };

  const closeModal = () => { setBuyTarget(null); setDone(false); setBuyError(null); setOrder({ customerName: '', customerEmail: '', quantity: 1 }); };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full bg-turquoise" />
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FaShoppingBag className="text-turquoise text-base" />
          Produtos do Evento
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="skeleton h-36 w-full" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => {
            const outOfStock = p.stock === 0;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-[#003B4A] to-[#00C2A8] flex items-center justify-center">
                    <FaShoppingBag className="text-white text-3xl opacity-60" />
                  </div>
                )}
                <div className="p-3 flex flex-col flex-1">
                  <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">{p.name}</p>
                  <div className="mt-2 flex items-end justify-between gap-1">
                    <div>
                      <p className="text-base font-black text-[#003B4A]">
                        R$ {Number(p.price).toFixed(2).replace('.', ',')}
                      </p>
                      <p className={`text-[11px] font-semibold ${outOfStock ? 'text-red-400' : p.stock <= 5 ? 'text-amber-500' : 'text-gray-400'}`}>
                        {outOfStock ? 'Esgotado' : `${p.stock} em estoque`}
                      </p>
                    </div>
                    <button
                      onClick={() => !outOfStock && setBuyTarget(p)}
                      disabled={outOfStock}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                      style={{ background: outOfStock ? '#9ca3af' : 'linear-gradient(135deg,#003B4A,#00C2A8)' }}
                    >
                      <FaShoppingCart className="text-[10px]" /> Comprar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Buy Modal */}
      {buyTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Finalizar pedido</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            {done ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-3xl text-green-500" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">Pedido realizado!</h4>
                <p className="text-gray-500 text-sm mb-5">O organizador entrará em contato pelo e-mail informado.</p>
                <button onClick={closeModal} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: '#00C2A8' }}>Fechar</button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Product summary */}
                <div className="bg-gray-50 rounded-xl p-3 flex gap-3 items-center">
                  {buyTarget.imageUrl
                    ? <img src={buyTarget.imageUrl} alt={buyTarget.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#003B4A] to-[#00C2A8] flex items-center justify-center flex-shrink-0"><FaShoppingBag className="text-white" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{buyTarget.name}</p>
                    <p className="text-[#00C2A8] font-black">R$ {Number(buyTarget.price).toFixed(2).replace('.', ',')}</p>
                    <p className="text-xs text-gray-400">{buyTarget.stock} em estoque</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Quantidade</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setOrder(o => ({ ...o, quantity: Math.max(1, o.quantity - 1) }))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors font-bold text-lg">−</button>
                    <span className="w-10 text-center font-bold text-gray-900">{order.quantity}</span>
                    <button onClick={() => setOrder(o => ({ ...o, quantity: Math.min(buyTarget.stock, o.quantity + 1) }))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors font-bold text-lg">+</button>
                    <span className="text-sm text-gray-500 ml-1">Total: <span className="font-bold text-gray-900">R$ {total}</span></span>
                  </div>
                </div>

                <input className="input-form" placeholder="Seu nome *" value={order.customerName} onChange={e => setOrder(o => ({ ...o, customerName: e.target.value }))} />
                <input className="input-form" type="email" placeholder="Seu e-mail *" value={order.customerEmail} onChange={e => setOrder(o => ({ ...o, customerEmail: e.target.value }))} />
                <input className="input-form" placeholder="Telefone (opcional)" value={order.customerPhone ?? ''} onChange={e => setOrder(o => ({ ...o, customerPhone: e.target.value }))} />
                <textarea className="input-form resize-none" rows={2} placeholder="Tamanho, cor, observações..." value={order.notes ?? ''} onChange={e => setOrder(o => ({ ...o, notes: e.target.value }))} />

                {buyError && <p className="text-sm text-red-500">{buyError}</p>}
                <button onClick={submitBuy} disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}>
                  {saving ? 'Enviando...' : `Confirmar pedido · R$ ${total}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

interface OrganizerInfo {
  id: number;
  companyName: string;
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  isVerified: boolean;
}

function parseEventImages(bannerUrl?: string | null): string[] {
  if (!bannerUrl) return [];
  try {
    const parsed = JSON.parse(bannerUrl);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[];
  } catch {}
  return [bannerUrl];
}

function ImageCarousel({ images, title, gradient }: { images: string[]; title: string; gradient: string }) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-[120px] opacity-40 blur-sm select-none" />
      </div>
    );
  }

  if (images.length === 1) {
    return <img src={images[0]} alt={title} className="w-full h-full object-cover" />;
  }

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  return (
    <div className="w-full h-full relative group/carousel">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${title} — imagem ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        />
      ))}

      {/* Setas */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-3 sm:left-14 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-black/60 backdrop-blur-sm"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-black/60 backdrop-blur-sm"
      >
        <FaChevronRight />
      </button>

      {/* Dots */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className="rounded-full transition-all"
            style={{
              width: i === current ? 20 : 8,
              height: 8,
              background: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>

      {/* Contador */}
      <div className="absolute top-6 right-20 z-20 glass rounded-full px-3 py-1 text-white text-xs font-semibold">
        {current + 1} / {images.length}
      </div>
    </div>
  );
}

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
  const [organizer, setOrganizer] = useState<OrganizerInfo | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [organizerWarning, setOrganizerWarning] = useState(false);

  useEffect(() => {
    if (eventId) fetchTickets();
  }, [eventId, fetchTickets]);

  useEffect(() => {
    if (!event?.organizerId) return;
    fetch(`${API_URL}/organizers/${event.organizerId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setOrganizer(data); })
      .catch(() => {});
  }, [event?.organizerId]);

  const getAvailable = (ticket: Ticket) => ticket.quantityAvailable - ticket.quantitySold;
  const calculateTotal = () => selectedTicket ? Number(selectedTicket.price) * ticketQuantity : 0;

  const proceedToCheckout = () => {
    if (!selectedTicket || !eventId) return;
    router.push(`${CHECKOUT_PATH}?eventId=${eventId}&ticketId=${selectedTicket.id}&quantity=${ticketQuantity}`);
  };

  const handleBuy = () => {
    if (!selectedTicket || !eventId) return;
    const token = apiClient.getToken();
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    const role = storage.getUserRole();
    if (role === 'organizer') {
      setOrganizerWarning(true);
      return;
    }
    proceedToCheckout();
  };

  const handleLoginSuccess = (role: string) => {
    setShowLoginModal(false);
    if (role === 'organizer') {
      setOrganizerWarning(true);
      return;
    }
    proceedToCheckout();
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
  const images     = parseEventImages(event.bannerUrl);
  const hasTickets = tickets.length > 0;
  const venueInfo  = event.venueName || event.address || 'Local a definir';
  const locationInfo = [venueInfo, event.city, event.state].filter(Boolean).join(', ');

  const endRef = event.eventEndDate ? new Date(event.eventEndDate) : new Date(event.eventDate);
  const isEventEnded = endRef < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de login */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
          eventTitle={event.title}
        />
      )}

      {/* Aviso conta de organizador */}
      {organizerWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOrganizerWarning(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🏢
            </div>
            <h3 className="font-black text-gray-900 text-xl mb-2">Conta de Organizador</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Você está logado com uma conta de organizador. Contas de organizador não podem comprar ingressos.
              <br /><br />
              Para comprar, crie uma conta de participante ou faça login com outra conta.
            </p>
            <button
              onClick={() => setOrganizerWarning(false)}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ========================= HERO DO EVENTO ========================= */}
      <div className="relative h-[52vh] min-h-[320px] overflow-hidden">
        {images.length > 0 ? (
          <ImageCarousel images={images} title={event.title} gradient={gradient} />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-[120px] opacity-40 blur-sm select-none">{catIcon}</span>
          </div>
        )}

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Badge encerrado */}
        {isEventEnded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white font-black text-xl sm:text-2xl px-8 py-4 rounded-2xl tracking-widest uppercase flex items-center gap-3">
              <span>🏁</span>
              <span>Evento Encerrado</span>
            </div>
          </div>
        )}

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

            {/* Localização no mapa */}
            <EventMapCard
              venueName={event.venueName}
              address={event.address}
              city={event.city}
              state={event.state}
            />

            {/* Card do Organizador */}
            {organizer && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-turquoise rounded-full" />
                  Sobre o Organizador
                </h2>
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {organizer.logoUrl ? (
                      <img
                        src={organizer.logoUrl}
                        alt={organizer.companyName}
                        className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
                        style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}>
                        {organizer.companyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-lg">{organizer.companyName}</h3>
                      {organizer.isVerified && (
                        <span className="flex items-center gap-1 text-[#00C2A8] text-xs font-bold bg-[#00C2A8]/10 px-2 py-0.5 rounded-full">
                          <FaCheckDouble className="text-[10px]" /> Verificado
                        </span>
                      )}
                    </div>
                    {(organizer.city || organizer.state) && (
                      <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-[10px]" />
                        {[organizer.city, organizer.state].filter(Boolean).join(' - ')}
                      </p>
                    )}
                    {organizer.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{organizer.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <a
                        href={`/organizers/${organizer.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00C2A8] hover:underline"
                      >
                        <FaUserTie className="text-xs" />
                        Ver perfil completo
                        <FaExternalLinkAlt className="text-[10px]" />
                      </a>
                      {organizer.website && (
                        <a
                          href={organizer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          Site oficial
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mural */}
            {eventId && <EventWall eventId={eventId} />}

            {/* Produtos do evento */}
            {eventId && <EventStoreSection eventId={eventId} />}
          </div>

          {/* ---- Sidebar de ingressos ---- */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
              {isEventEnded ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                    🏁
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">Evento Encerrado</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Este evento já foi realizado.<br />A venda de ingressos está encerrada.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <FaCalendarAlt className="text-xs" />
                    Realizado em {new Date(endRef).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              ) : (
              <>
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
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
