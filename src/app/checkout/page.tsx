'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FaArrowLeft,
  FaLock,
  FaCheck,
  FaTicketAlt,
  FaCalendarAlt,
  FaShoppingCart,
  FaExternalLinkAlt,
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

const CHECKOUT_STEPS = [
  { id: 'tickets', title: 'Ingressos', description: 'Selecione' },
  { id: 'review', title: 'Revisão', description: 'Confirme' },
  { id: 'payment', title: 'Pagamento', description: 'Mercado Pago' },
] as const;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();

  const eventIdParam = searchParams.get('eventId');
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;

  const { event, loading: eventLoading } = useEvent(eventId);
  const { tickets, loading: ticketsLoading, fetchTickets } = useTickets(eventId || undefined);

  const [currentStep, setCurrentStep] = useState(0);
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (eventId) fetchTickets();
  }, [eventId, fetchTickets]);

  const calculateTotal = () =>
    ticketSelections.reduce((sum, s) => sum + s.totalPrice, 0);

  const updateTicketSelection = (ticket: Ticket, quantity: number) => {
    if (quantity === 0) {
      setTicketSelections((prev) => prev.filter((ts) => ts.ticketId !== ticket.id));
      return;
    }
    setTicketSelections((prev) => {
      const filtered = prev.filter((ts) => ts.ticketId !== ticket.id);
      return [
        ...filtered,
        {
          ticketId: ticket.id,
          ticketName: ticket.name,
          quantity,
          unitPrice: Number(ticket.price),
          totalPrice: Number(ticket.price) * quantity,
        },
      ];
    });
  };

  const getAvailable = (ticket: Ticket) => ticket.quantityAvailable - ticket.quantitySold;

  /** Cria o pedido no backend e redireciona para o Mercado Pago */
  const handleGoToPayment = async () => {
    setError(null);
    setRedirecting(true);

    const token = getToken();
    if (!token) {
      router.push('/login?redirect=/checkout?eventId=' + eventId);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: ticketSelections.map((s) => ({
            ticketId: s.ticketId,
            quantity: s.quantity,
          })),
          backUrl: window.location.origin,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao criar pedido');
      }

      const data = await res.json();

      // Redireciona para o checkout do Mercado Pago
      // Em sandbox usa sandboxInitPoint; em produção usa initPoint
      const url =
        process.env.NODE_ENV === 'production' ? data.initPoint : data.sandboxInitPoint;

      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      setRedirecting(false);
    }
  };

  if (eventLoading || ticketsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-turquoise border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!event || !eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">Evento não encontrado</p>
            <Button onClick={() => router.push('/events')}>Voltar para Eventos</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── STEP 0: seleção de ingressos ── */
  const renderStep0 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Selecione seus ingressos</h2>
        <p className="text-gray-500">{event.title}</p>
      </div>

      {tickets.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Nenhum ingresso disponível</p>
      ) : (
        tickets.map((ticket) => {
          const available = getAvailable(ticket);
          const selected = ticketSelections.find((ts) => ts.ticketId === ticket.id)?.quantity ?? 0;
          const soldOut = available <= 0 || !ticket.isActive;

          return (
            <Card key={ticket.id} className={`transition-all ${selected > 0 ? 'ring-2 ring-[#00C2A8]' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">{ticket.name}</h3>
                      {soldOut && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Esgotado</span>
                      )}
                    </div>
                    {ticket.description && (
                      <p className="text-sm text-gray-500 mb-2">{ticket.description}</p>
                    )}
                    <span className="text-2xl font-bold" style={{ color: '#00C2A8' }}>
                      {formatPrice(Number(ticket.price))}
                    </span>
                    {!soldOut && (
                      <span className="text-xs text-gray-400 ml-3">{available} disponíveis</span>
                    )}
                  </div>
                </div>

                {!soldOut && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateTicketSelection(ticket, Math.max(0, selected - 1))}
                        disabled={selected <= 0}
                        className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold disabled:opacity-40 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800">{selected}</span>
                      <button
                        onClick={() => updateTicketSelection(ticket, Math.min(available, ticket.maxPerOrder, selected + 1))}
                        disabled={selected >= Math.min(available, ticket.maxPerOrder)}
                        className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold disabled:opacity-40 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    {selected > 0 && (
                      <span className="text-gray-600 font-medium">
                        = {formatPrice(Number(ticket.price) * selected)}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  /* ── STEP 1: revisão e confirmação ── */
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Revisar pedido</h2>
        <p className="text-gray-500">Confirme os ingressos antes de pagar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FaCalendarAlt className="text-[#00C2A8]" />
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-500">{formatLongDate(event.eventDate)}</p>
          {event.venueName && <p className="text-sm text-gray-500">{event.venueName}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FaTicketAlt className="text-[#00C2A8]" />
            Ingressos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {ticketSelections.map((s) => (
            <div key={s.ticketId} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-800">{s.ticketName}</p>
                <p className="text-sm text-gray-500">{s.quantity}x {formatPrice(s.unitPrice)}</p>
              </div>
              <span className="font-semibold text-gray-800">{formatPrice(s.totalPrice)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-gray-800">Total</span>
            <span className="text-xl font-bold" style={{ color: '#00C2A8' }}>
              {formatPrice(calculateTotal())}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Pagamento via Mercado Pago</p>
        <p>Você será redirecionado para o ambiente seguro do Mercado Pago onde poderá pagar com PIX, cartão de crédito/débito ou boleto.</p>
      </div>

      <Button
        className="w-full text-white py-4 text-lg font-semibold rounded-xl flex items-center justify-center gap-2"
        style={{ backgroundColor: '#00C2A8' }}
        onClick={handleGoToPayment}
        disabled={redirecting}
      >
        {redirecting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Redirecionando...
          </>
        ) : (
          <>
            <FaExternalLinkAlt />
            Ir para Pagamento
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-[#00C2A8] transition-colors flex items-center gap-2"
          >
            <FaArrowLeft /> Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Finalizar Compra</h1>
            <p className="text-gray-500 text-sm">Pagamento seguro via Mercado Pago</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {CHECKOUT_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    index < currentStep
                      ? 'text-white'
                      : index === currentStep
                      ? 'border-2 text-[#00C2A8] border-[#00C2A8]'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  style={index < currentStep ? { backgroundColor: '#00C2A8' } : {}}
                >
                  {index < currentStep ? <FaCheck className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`text-xs mt-1 font-medium ${index <= currentStep ? 'text-gray-700' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
              {index < CHECKOUT_STEPS.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 mb-4 ${index < currentStep ? 'bg-[#00C2A8]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardContent className="p-8">
                {currentStep === 0 && renderStep0()}
                {currentStep === 1 && renderStep1()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="border-gray-300 text-gray-600 hover:border-[#00C2A8] hover:text-[#00C2A8]"
              >
                Anterior
              </Button>
              {currentStep < 1 && (
                <Button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={ticketSelections.length === 0}
                  className="text-white"
                  style={{ backgroundColor: '#00C2A8' }}
                >
                  Continuar
                </Button>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="space-y-4">
            <Card className="shadow-sm border-0 sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FaShoppingCart className="text-[#00C2A8]" />
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="font-medium text-gray-800 text-sm">{event.title}</p>
                <p className="text-xs text-gray-500">{formatLongDate(event.eventDate)}</p>

                {ticketSelections.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">Nenhum ingresso selecionado</p>
                ) : (
                  <>
                    {ticketSelections.map((s) => (
                      <div key={s.ticketId} className="flex justify-between text-sm">
                        <span className="text-gray-500">{s.quantity}x {s.ticketName}</span>
                        <span className="font-medium text-gray-800">{formatPrice(s.totalPrice)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="font-bold text-lg" style={{ color: '#00C2A8' }}>
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0">
              <CardContent className="p-4 flex items-start gap-3">
                <FaLock className="text-[#00C2A8] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">Compra 100% Segura</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pagamento processado pelo Mercado Pago com criptografia SSL.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
