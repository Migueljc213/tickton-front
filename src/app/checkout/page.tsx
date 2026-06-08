'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaLock,
  FaCheck,
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaExternalLinkAlt,
  FaShieldAlt,
} from 'react-icons/fa';
import { useEvent, useTickets, useAuth } from '@/hooks';
import { formatPrice, formatLongDate } from '@/lib/utils/format';
import type { Ticket } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface TicketSelection {
  ticketId: number;
  ticketName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const STEPS = ['Ingressos', 'Seus Dados', 'Revisão', 'Pagamento'] as const;

interface DemographicData {
  gender: string;
  age: string;
  neighborhood: string;
}

/* ─── Skeleton de carregamento ─── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Carregando evento...</p>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();

  const eventIdParam = searchParams.get('eventId');
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;

  const { event, loading: eventLoading } = useEvent(eventId);
  const { tickets, loading: ticketsLoading, fetchTickets } = useTickets(eventId || undefined);

  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<TicketSelection[]>([]);
  const [demographics, setDemographics] = useState<DemographicData>({ gender: '', age: '', neighborhood: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (eventId) fetchTickets();
  }, [eventId, fetchTickets]);

  const PLATFORM_FEE_RATE = 0.07;
  const subtotal = selections.reduce((s, x) => s + x.totalPrice, 0);
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
  const total = subtotal + platformFee;
  const getAvailable = (t: Ticket) => t.quantityAvailable - t.quantitySold;

  const updateSelection = (ticket: Ticket, qty: number) => {
    if (qty === 0) {
      setSelections((p) => p.filter((s) => s.ticketId !== ticket.id));
      return;
    }
    setSelections((p) => [
      ...p.filter((s) => s.ticketId !== ticket.id),
      {
        ticketId: ticket.id,
        ticketName: ticket.name,
        quantity: qty,
        unitPrice: Number(ticket.price),
        totalPrice: Number(ticket.price) * qty,
      },
    ]);
  };

  const handlePayment = async () => {
    setError(null);
    setSubmitting(true);
    const token = getToken();
    if (!token) {
      router.push('/login?redirect=/checkout?eventId=' + eventId);
      return;
    }
    try {
      let res: Response;
      try {
        res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            items: selections.map((s) => ({ ticketId: s.ticketId, quantity: s.quantity })),
            backUrl: window.location.origin,
            ...(demographics.gender ? { customerGender: demographics.gender } : {}),
            ...(demographics.age ? { customerAge: parseInt(demographics.age, 10) } : {}),
            ...(demographics.neighborhood ? { customerNeighborhood: demographics.neighborhood } : {}),
          }),
        });
      } catch {
        throw new Error(
          'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        );
      }

      if (!res.ok) {
        let message: string | undefined;
        try {
          const d = await res.json();
          message = Array.isArray(d.message) ? d.message[0] : d.message;
        } catch {
          // body não é JSON
        }

        if (res.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente para continuar.');
        }
        if (res.status === 403) {
          throw new Error('Você não tem permissão para realizar esta compra.');
        }
        if (res.status === 404) {
          throw new Error(message ?? 'Ingresso não encontrado. Atualize a página e tente novamente.');
        }
        if (res.status === 409) {
          throw new Error(message ?? 'Não há ingressos disponíveis para a quantidade solicitada.');
        }
        if (res.status === 422) {
          throw new Error(message ?? 'Dados inválidos. Verifique a seleção e tente novamente.');
        }
        if (res.status >= 500) {
          throw new Error('Erro interno do servidor. Tente novamente em instantes.');
        }
        throw new Error(message ?? 'Erro ao processar o pedido. Tente novamente.');
      }

      const data = await res.json();

      // Fluxo sem pagamento (BYPASS_PAYMENT ativo no backend)
      if (data.bypass || !data.initPoint) {
        router.push(`/checkout/success?order=${data.orderId}`);
        return;
      }

      // Fluxo Mercado Pago
      const url = process.env.NODE_ENV === 'production' ? data.initPoint : data.sandboxInitPoint;
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento. Tente novamente.');
      setSubmitting(false);
    }
  };

  if (eventLoading || ticketsLoading) return <LoadingSkeleton />;

  if (!event || !eventId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-700 font-semibold mb-4">Evento não encontrado</p>
          <button
            onClick={() => router.push('/events')}
            className="px-6 py-2.5 bg-[#00C2A8] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Ver Eventos
          </button>
        </div>
      </div>
    );
  }

  /* ─── STEP 0: selecionar ingressos ─── */
  const renderTickets = () => (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Selecione seus ingressos</h2>
        <p className="text-gray-500 text-sm mt-1">{event.title}</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-14 text-gray-400">
          <FaTicketAlt className="text-4xl mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum ingresso disponível</p>
        </div>
      ) : (
        tickets.map((ticket) => {
          const avail = getAvailable(ticket);
          const sel = selections.find((s) => s.ticketId === ticket.id)?.quantity ?? 0;
          const soldOut = avail <= 0 || !ticket.isActive;

          return (
            <div
              key={ticket.id}
              className={`border-2 rounded-2xl p-5 transition-all ${
                soldOut
                  ? 'border-gray-100 bg-gray-50 opacity-60'
                  : sel > 0
                  ? 'border-[#00C2A8] bg-[#00C2A8]/5'
                  : 'border-gray-200 bg-white hover:border-[#00C2A8]/40'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                    {soldOut && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Esgotado
                      </span>
                    )}
                  </div>
                  {ticket.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{ticket.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[#00C2A8]">
                    {Number(ticket.price) === 0 ? 'Grátis' : formatPrice(Number(ticket.price))}
                  </p>
                  {!soldOut && (
                    <p className="text-[11px] text-gray-400">{avail} disponíveis</p>
                  )}
                </div>
              </div>

              {!soldOut && (
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateSelection(ticket, Math.max(0, sel - 1))}
                    disabled={sel <= 0}
                    className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg disabled:opacity-30 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors"
                  >
                    −
                  </button>
                  <span className="w-7 text-center font-bold text-gray-900">{sel}</span>
                  <button
                    onClick={() => updateSelection(ticket, Math.min(avail, ticket.maxPerOrder, sel + 1))}
                    disabled={sel >= Math.min(avail, ticket.maxPerOrder)}
                    className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg disabled:opacity-30 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors"
                  >
                    +
                  </button>
                  {sel > 0 && (
                    <span className="ml-1 text-sm font-semibold text-gray-700">
                      = {formatPrice(Number(ticket.price) * sel)}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  /* ─── STEP 1: dados demográficos (opcional) ─── */
  const renderDemographics = () => (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Sobre você</h2>
        <p className="text-gray-500 text-sm mt-1">
          Dados opcionais — ajudam o organizador a melhorar o evento.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gênero</label>
          <select
            value={demographics.gender}
            onChange={e => setDemographics(d => ({ ...d, gender: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:border-[#00C2A8]"
          >
            <option value="">Prefiro não informar</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="nao_binario">Não-binário</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Idade</label>
          <input
            type="number"
            min={1}
            max={120}
            placeholder="Ex: 25"
            value={demographics.age}
            onChange={e => setDemographics(d => ({ ...d, age: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#00C2A8]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bairro / Cidade de origem</label>
          <input
            type="text"
            placeholder="Ex: Copacabana"
            maxLength={100}
            value={demographics.neighborhood}
            onChange={e => setDemographics(d => ({ ...d, neighborhood: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#00C2A8]"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Todas as informações acima são opcionais e utilizadas apenas para análise do evento.
      </p>
    </div>
  );

  /* ─── STEP 2: revisão ─── */
  const renderReview = () => (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Revisar pedido</h2>
        <p className="text-gray-500 text-sm mt-1">Confirme seus ingressos antes de pagar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Dados do evento */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="font-semibold text-gray-900 mb-2">{event.title}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaCalendarAlt className="text-[#00C2A8] shrink-0" />
            <span>{formatLongDate(event.eventDate)}</span>
          </div>
          {(event.venueName || event.city) && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaMapMarkerAlt className="text-[#00C2A8] shrink-0" />
              <span>{[event.venueName, event.city, event.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de ingressos */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FaTicketAlt className="text-[#00C2A8]" /> Ingressos selecionados
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {selections.map((s) => (
            <div key={s.ticketId} className="flex justify-between items-center px-5 py-3">
              <div>
                <p className="font-medium text-gray-800 text-sm">{s.ticketName}</p>
                <p className="text-xs text-gray-400">{s.quantity}x {formatPrice(s.unitPrice)}</p>
              </div>
              <span className="font-semibold text-gray-900">{formatPrice(s.totalPrice)}</span>
            </div>
          ))}
          <div className="px-5 py-3 border-t border-gray-100 space-y-2 bg-gray-50/50">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {platformFee > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Taxa de serviço (7%)</span>
                <span>{formatPrice(platformFee)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center px-5 py-4 bg-gray-50 border-t border-gray-200">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-[#00C2A8]">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Info pagamento */}
      <div className="flex items-start gap-3 bg-[#00C2A8]/8 border border-[#00C2A8]/20 rounded-xl px-4 py-3">
        <FaShieldAlt className="text-[#00C2A8] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-800">Compra protegida</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Seus ingressos serão gerados imediatamente após a confirmação do pedido.
          </p>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={submitting}
        className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 text-base"
        style={{ backgroundColor: '#00C2A8' }}
      >
        {submitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <FaLock className="text-sm" />
            Confirmar compra
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">Finalizar Compra</h1>
              <p className="text-xs text-gray-400">Seus dados estão protegidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl py-4">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      i < step
                        ? 'bg-[#00C2A8] text-white'
                        : i === step
                        ? 'border-2 border-[#00C2A8] text-[#00C2A8]'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {i < step ? <FaCheck className="text-xs" /> : i + 1}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      i <= step ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-1 ${i < step ? 'bg-[#00C2A8]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 max-w-5xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {step === 0 && renderTickets()}
              {step === 1 && renderDemographics()}
              {step === 2 && renderReview()}
            </div>

            {/* Botões de navegação */}
            {step === 0 && (
              <div className="mt-5">
                <button
                  onClick={() => setStep(1)}
                  disabled={selections.length === 0}
                  className="w-full py-4 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 text-base"
                  style={{ backgroundColor: '#00C2A8' }}
                >
                  Continuar → Seus Dados
                </button>
              </div>
            )}
            {step === 1 && (
              <div className="mt-5">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-xl font-bold text-white transition-opacity hover:opacity-90 text-base"
                  style={{ backgroundColor: '#00C2A8' }}
                >
                  Continuar → Revisão
                </button>
              </div>
            )}
          </div>

          {/* Sidebar resumo */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <FaShoppingCart className="text-[#00C2A8]" /> Resumo
              </h3>

              <p className="font-semibold text-gray-800 text-sm">{event.title}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <FaCalendarAlt className="text-[#00C2A8]" />
                {formatLongDate(event.eventDate)}
              </p>

              <div className="mt-4 space-y-2">
                {selections.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhum ingresso selecionado</p>
                ) : (
                  <>
                    {selections.map((s) => (
                      <div key={s.ticketId} className="flex justify-between text-sm">
                        <span className="text-gray-500">{s.quantity}x {s.ticketName}</span>
                        <span className="font-semibold text-gray-800">{formatPrice(s.totalPrice)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-2 space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      {platformFee > 0 && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Taxa de serviço (7%)</span>
                          <span>{formatPrice(platformFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                        <span className="font-bold text-gray-900 text-sm">Total</span>
                        <span className="text-lg font-bold text-[#00C2A8]">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Badge segurança */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00C2A8]/10 flex items-center justify-center shrink-0">
                <FaLock className="text-[#00C2A8] text-xs" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Compra 100% Segura</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Transação protegida com criptografia SSL de ponta a ponta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
