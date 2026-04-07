'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FaArrowLeft,
  FaLock,
  FaCreditCard,
  FaQrcode,
  FaCheck,
  FaTicketAlt,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useEvent, useTickets, useOrders, useAuth } from '@/hooks';
import { formatPrice, formatLongDate } from '@/lib/utils/format';
import { isFieldEmpty } from '@/lib/utils/validation';
import type { Ticket } from '@/types/api';

interface TicketSelection {
  ticketId: number;
  ticketName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const CHECKOUT_STEPS = [
  { id: 'tickets', title: 'Ingressos', description: 'Selecione seus ingressos' },
  { id: 'customer', title: 'Dados Pessoais', description: 'Informações do comprador' },
  { id: 'payment', title: 'Pagamento', description: 'Método de pagamento' },
  { id: 'confirmation', title: 'Confirmação', description: 'Revisar e finalizar' },
] as const;

const PAYMENT_METHODS = {
  PIX: 'pix',
  CREDIT_CARD: 'credit_card',
} as const;

const CHECKOUT_SUCCESS_PATH = '/checkout/success';
const LOGIN_PATH = '/login';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getUserId } = useAuth();
  const { createOrder, loading: orderLoading } = useOrders();

  const eventIdParam = searchParams.get('eventId');
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;
  
  const { event, loading: eventLoading } = useEvent(eventId);
  const { tickets, loading: ticketsLoading, fetchTickets } = useTickets(eventId || undefined);

  const [currentStep, setCurrentStep] = useState(0);
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchTickets();
    }
  }, [eventId, fetchTickets]);

  const calculateTotal = () => {
    return ticketSelections.reduce((total, selection) => total + selection.totalPrice, 0);
  };

  const updateTicketSelection = (ticket: Ticket, quantity: number) => {
    if (quantity === 0) {
      setTicketSelections(prev => prev.filter(ts => ts.ticketId !== ticket.id));
      return;
    }

    const selection: TicketSelection = {
      ticketId: ticket.id,
      ticketName: ticket.name,
      quantity,
      unitPrice: Number(ticket.price),
      totalPrice: Number(ticket.price) * quantity,
    };

    setTicketSelections(prev => {
      const filtered = prev.filter(ts => ts.ticketId !== ticket.id);
      return [...filtered, selection];
    });
  };

  const getAvailableQuantity = (ticket: Ticket) => {
    return ticket.quantityAvailable - ticket.quantitySold;
  };

  const nextStep = () => {
    if (currentStep < CHECKOUT_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalizeOrder = async () => {
    if (!eventId) return;
    
    setError(null);
    const userId = getUserId();
    if (!userId) {
      setError('Você precisa estar logado para finalizar a compra');
      router.push(LOGIN_PATH);
      return;
    }

    try {
      const orderData = {
        userId,
        eventId,
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerEmail,
        customerPhone: customerInfo.customerPhone || undefined,
        paymentMethod: paymentMethod || undefined,
        items: ticketSelections.map(ts => ({
          ticketId: ts.ticketId,
          quantity: ts.quantity,
        })),
      };

      const result = await createOrder(orderData);
      router.push(`${CHECKOUT_SUCCESS_PATH}?orderId=${result.order.id}`);
    } catch {
      setError('Erro ao finalizar pedido');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return ticketSelections.length > 0;
      case 1:
        return !isFieldEmpty(customerInfo.customerName) && 
               !isFieldEmpty(customerInfo.customerEmail) && 
               !isFieldEmpty(customerInfo.customerPhone);
      case 2:
        return paymentMethod !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (eventLoading || ticketsLoading) {
    return (
      <div className="min-h-screen bg-light-gray/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-medium-gray text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!event || !eventId) {
    return (
      <div className="min-h-screen bg-light-gray/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">Evento não encontrado</p>
            <Button onClick={() => router.push('/events')}>
              Voltar para Eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-dark-gray mb-2">Selecionar Ingressos</h2>
              <p className="text-medium-gray">Escolha os ingressos para o evento</p>
            </div>

            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-medium-gray text-center py-8">Nenhum ingresso disponível</p>
              ) : (
                tickets.map((ticket) => {
                  const available = getAvailableQuantity(ticket);
                  const selectedQuantity = ticketSelections.find(ts => ts.ticketId === ticket.id)?.quantity || 0;
                  const isSoldOut = available <= 0 || !ticket.isActive;

                  return (
                    <Card key={ticket.id} className="border border-light-gray">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-dark-gray">{ticket.name}</h3>
                            {ticket.description && (
                              <p className="text-medium-gray mt-1">{ticket.description}</p>
                            )}
                            <div className="mt-3">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <span className="text-2xl font-bold text-turquoise">
                                    {formatPrice(Number(ticket.price))}
                                  </span>
                                </div>
                                <div className="text-sm text-medium-gray">
                                  {isSoldOut ? 'Esgotado' : `${available} disponível${available !== 1 ? 'is' : ''}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {!isSoldOut && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateTicketSelection(ticket, Math.max(0, selectedQuantity - 1))}
                                disabled={selectedQuantity <= 0}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center font-medium">{selectedQuantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateTicketSelection(ticket, Math.min(available, selectedQuantity + 1))}
                                disabled={selectedQuantity >= available}
                              >
                                +
                              </Button>
                            </div>
                            {selectedQuantity > 0 && (
                              <div className="text-right">
                                <div className="text-lg font-semibold text-dark-gray">
                                  {formatPrice(Number(ticket.price) * selectedQuantity)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-dark-gray mb-2">Dados Pessoais</h2>
              <p className="text-medium-gray">Informações do comprador dos ingressos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={customerInfo.customerName}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={customerInfo.customerEmail}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={customerInfo.customerPhone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <div className="bg-light-green/20 rounded-lg p-4">
              <h3 className="font-semibold text-dark-gray mb-2">Importante:</h3>
              <ul className="text-sm text-medium-gray space-y-1">
                <li>• Os dados informados serão utilizados para emissão dos ingressos</li>
                <li>• Você receberá a confirmação por e-mail</li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-dark-gray mb-2">Método de Pagamento</h2>
              <p className="text-medium-gray">Escolha como deseja pagar seus ingressos</p>
            </div>

            <div className="space-y-4">
              <Card
                className={`cursor-pointer transition-all ${
                  paymentMethod === PAYMENT_METHODS.PIX
                    ? 'ring-2 ring-turquoise border-turquoise'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setPaymentMethod(PAYMENT_METHODS.PIX)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-turquoise/10 rounded-lg flex items-center justify-center">
                      <FaQrcode className="w-6 h-6 text-turquoise" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark-gray">PIX</h3>
                      <p className="text-sm text-medium-gray">Pagamento instantâneo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  paymentMethod === PAYMENT_METHODS.CREDIT_CARD
                    ? 'ring-2 ring-turquoise border-turquoise'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setPaymentMethod(PAYMENT_METHODS.CREDIT_CARD)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-light-green/20 rounded-lg flex items-center justify-center">
                      <FaCreditCard className="w-6 h-6 text-dark-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark-gray">Cartão de Crédito</h3>
                      <p className="text-sm text-medium-gray">Parcelamento disponível</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-dark-gray mb-2">Confirmação</h2>
              <p className="text-medium-gray">Revise seus dados antes de finalizar a compra</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-turquoise" />
                    Resumo do Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-light-gray rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark-gray">{event.title}</h3>
                      <p className="text-sm text-medium-gray">{formatLongDate(event.eventDate)}</p>
                      <p className="text-sm text-medium-gray">
                        {event.venueName || event.city || 'Local a definir'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaTicketAlt className="mr-2 text-turquoise" />
                    Ingressos Selecionados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ticketSelections.map((selection) => (
                      <div key={selection.ticketId} className="flex justify-between items-center py-3 border-b last:border-b-0">
                        <div>
                          <h4 className="font-medium text-dark-gray">{selection.ticketName}</h4>
                          <p className="text-sm text-medium-gray">
                            {selection.quantity}x {formatPrice(selection.unitPrice)}
                          </p>
                        </div>
                        <div className="font-semibold text-dark-gray">
                          {formatPrice(selection.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dados do Comprador</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-medium-gray">Nome:</span>
                      <p className="font-medium text-dark-gray">{customerInfo.customerName}</p>
                    </div>
                    <div>
                      <span className="text-medium-gray">E-mail:</span>
                      <p className="font-medium text-dark-gray">{customerInfo.customerEmail}</p>
                    </div>
                    <div>
                      <span className="text-medium-gray">Telefone:</span>
                      <p className="font-medium text-dark-gray">{customerInfo.customerPhone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-light-green/20">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="text-dark-gray">Total:</span>
                      <span className="font-bold text-dark-gray">{formatPrice(calculateTotal())}</span>
                    </div>
                    <p className="text-sm text-medium-gray">
                      Pagamento via {paymentMethod === PAYMENT_METHODS.PIX ? 'PIX' : 'Cartão de Crédito'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-medium-gray hover:text-turquoise"
          >
            <FaArrowLeft className="mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-dark-gray">Finalizar Compra</h1>
            <p className="text-medium-gray">Complete sua compra de forma segura</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {CHECKOUT_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        index < currentStep
                          ? 'bg-turquoise text-white'
                          : index === currentStep
                          ? 'bg-turquoise/20 text-turquoise border-2 border-turquoise'
                          : 'bg-light-gray text-medium-gray'
                      }`}
                    >
                      {index < currentStep ? <FaCheck className="w-5 h-5" /> : index + 1}
                    </div>
                    {index < CHECKOUT_STEPS.length - 1 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          index < currentStep ? 'bg-turquoise' : 'bg-light-gray'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                {CHECKOUT_STEPS.map((step, index) => (
                  <div key={step.id} className="text-center">
                    <p
                      className={`text-sm font-medium ${
                        index <= currentStep ? 'text-dark-gray' : 'text-medium-gray'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-medium-gray">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-md">
              <CardContent className="p-8">{renderStepContent()}</CardContent>
            </Card>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white"
              >
                Anterior
              </Button>
              <Button
                onClick={currentStep === CHECKOUT_STEPS.length - 1 ? handleFinalizeOrder : nextStep}
                disabled={!canProceed() || orderLoading}
                className="bg-turquoise hover:bg-turquoise/90 text-white"
              >
                {orderLoading
                  ? 'Processando...'
                  : currentStep === CHECKOUT_STEPS.length - 1
                  ? 'Finalizar Compra'
                  : 'Continuar'}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-md sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <div className="w-16 h-16 bg-light-gray rounded-lg flex items-center justify-center">
                      <span className="text-xl">🎵</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark-gray text-sm">{event.title}</h3>
                      <p className="text-xs text-medium-gray">{formatLongDate(event.eventDate)}</p>
                      <p className="text-xs text-medium-gray">{event.city || ''}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ticketSelections.map((selection) => (
                      <div key={selection.ticketId} className="flex justify-between text-sm">
                        <span className="text-medium-gray">
                          {selection.quantity}x {selection.ticketName}
                        </span>
                        <span className="text-dark-gray font-medium">
                          {formatPrice(selection.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-dark-gray">Total:</span>
                      <span className="text-xl font-bold text-turquoise">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <FaLock className="w-5 h-5 text-turquoise mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-dark-gray mb-1">Compra Segura</h3>
                    <p className="text-sm text-medium-gray">
                      Seus dados estão protegidos com criptografia SSL de 256 bits.
                    </p>
                  </div>
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
    <Suspense fallback={<div>Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
