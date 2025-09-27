'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FaArrowLeft,
  FaLock,
  FaCreditCard,
  FaQrcode,
  FaBarcode,
  FaCheck,
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { CheckoutData, CheckoutStep, TicketSelection, CustomerInfo, PaymentMethod } from '@/types/checkout';
import { Ticket } from '@/types/event';

const checkoutSteps: CheckoutStep[] = [
  {
    id: 'tickets',
    title: 'Ingressos',
    description: 'Selecione seus ingressos',
    completed: false,
    active: true
  },
  {
    id: 'customer',
    title: 'Dados Pessoais',
    description: 'Informações do comprador',
    completed: false,
    active: false
  },
  {
    id: 'payment',
    title: 'Pagamento',
    description: 'Método de pagamento',
    completed: false,
    active: false
  },
  {
    id: 'confirmation',
    title: 'Confirmação',
    description: 'Revisar e finalizar',
    completed: false,
    active: false
  }
];

// Mock data - em produção viria de uma API
const mockEvent = {
  id: '1',
  title: 'Festival de Música Eletrônica 2025',
  date: '2025-03-15',
  time: '20:00',
  location: {
    name: 'Parque Ibirapuera',
    address: 'Av. Pedro Álvares Cabral, s/n',
    city: 'São Paulo',
    state: 'SP'
  },
  image: '/api/placeholder/400/200'
};

const mockTickets = [
  {
    id: '1',
    name: 'Pista',
    description: 'Acesso à área da pista com vista completa dos palcos',
    price: 120,
    originalPrice: 150,
    quantity: 1000,
    sold: 750,
    features: ['Acesso à pista principal', '3 palcos simultâneos', 'Área de alimentação'],
    isActive: true
  },
  {
    id: '2',
    name: 'VIP',
    description: 'Área VIP com vista privilegiada e serviços exclusivos',
    price: 250,
    originalPrice: 300,
    quantity: 200,
    sold: 120,
    features: ['Área VIP exclusiva', 'Bar premium', 'Banheiro exclusivo', 'Welcome drink'],
    isActive: true
  }
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({
    eventId: eventId || '1',
    ticketSelections: [],
    total: 0
  });

  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([]);
  const [customerInfo, setCustomerInfo] = useState<Partial<CustomerInfo>>({});
  const [paymentMethod, setPaymentMethod] = useState<Partial<PaymentMethod>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateTotal = () => {
    return ticketSelections.reduce((total, selection) => total + selection.totalPrice, 0);
  };

  const updateTicketSelection = (ticketId: string, quantity: number) => {
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket || quantity === 0) {
      setTicketSelections(prev => prev.filter(ts => ts.ticketTypeId !== ticketId));
      return;
    }

    const selection: TicketSelection = {
      ticketTypeId: ticket.id,
      ticketTypeName: ticket.name,
      quantity,
      unitPrice: ticket.price,
      totalPrice: ticket.price * quantity,
      features: ticket.features
    };

    setTicketSelections(prev => {
      const filtered = prev.filter(ts => ts.ticketTypeId !== ticketId);
      return [...filtered, selection];
    });
  };

  const getAvailableQuantity = (ticket: Ticket) => {
    return ticket.quantity - ticket.sold;
  };

  const nextStep = () => {
    if (currentStep < checkoutSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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
              {mockTickets.map((ticket) => {
                const available = getAvailableQuantity(ticket);
                const selectedQuantity = ticketSelections.find(ts => ts.ticketTypeId === ticket.id)?.quantity || 0;
                
                return (
                  <Card key={ticket.id} className="border border-light-gray">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-dark-gray">{ticket.name}</h3>
                          <p className="text-medium-gray mt-1">{ticket.description}</p>
                          <div className="mt-3">
                            <div className="flex items-center space-x-4">
                              <div>
                                <span className="text-2xl font-bold text-turquoise">
                                  {formatPrice(ticket.price)}
                                </span>
                                {ticket.originalPrice && (
                                  <span className="text-sm text-medium-gray line-through ml-2">
                                    {formatPrice(ticket.originalPrice)}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-medium-gray">
                                {available} disponível{available !== 1 ? 'is' : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateTicketSelection(ticket.id, Math.max(0, selectedQuantity - 1))}
                            disabled={selectedQuantity <= 0}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-medium">{selectedQuantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateTicketSelection(ticket.id, Math.min(available, selectedQuantity + 1))}
                            disabled={selectedQuantity >= available}
                          >
                            +
                          </Button>
                        </div>
                        {selectedQuantity > 0 && (
                          <div className="text-right">
                            <div className="text-lg font-semibold text-dark-gray">
                              {formatPrice(ticket.price * selectedQuantity)}
                            </div>
                          </div>
                        )}
                      </div>

                      {ticket.features.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm text-medium-gray mb-2">Inclui:</div>
                          <div className="space-y-1">
                            {ticket.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <FaCheck className="w-3 h-3 text-turquoise mr-2" />
                                <span className="text-dark-gray">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
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
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={customerInfo.firstName || ''}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Sobrenome *
                </label>
                <input
                  type="text"
                  value={customerInfo.lastName || ''}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="Seu sobrenome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={customerInfo.email || ''}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone || ''}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  value={customerInfo.document || ''}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, document: e.target.value }))}
                  className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="bg-light-green/20 rounded-lg p-4">
              <h3 className="font-semibold text-dark-gray mb-2">Importante:</h3>
              <ul className="text-sm text-medium-gray space-y-1">
                <li>• Os dados informados serão utilizados para emissão dos ingressos</li>
                <li>• O CPF deve ser o mesmo do portador do cartão (se aplicável)</li>
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
              {/* PIX */}
              <Card 
                className={`cursor-pointer transition-all ${
                  paymentMethod.type === 'pix' 
                    ? 'ring-2 ring-turquoise border-turquoise' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setPaymentMethod({ type: 'pix' })}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-turquoise/10 rounded-lg flex items-center justify-center">
                      <FaQrcode className="w-6 h-6 text-turquoise" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark-gray">PIX</h3>
                      <p className="text-sm text-medium-gray">Pagamento instantâneo com 5% de desconto</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-medium">5% OFF</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cartão de Crédito */}
              <Card 
                className={`cursor-pointer transition-all ${
                  paymentMethod.type === 'credit_card' 
                    ? 'ring-2 ring-turquoise border-turquoise' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setPaymentMethod({ type: 'credit_card' })}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-light-green/20 rounded-lg flex items-center justify-center">
                      <FaCreditCard className="w-6 h-6 text-dark-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark-gray">Cartão de Crédito</h3>
                      <p className="text-sm text-medium-gray">Parcelamento em até 12x sem juros</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">V</div>
                      <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">M</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Boleto */}
              <Card 
                className={`cursor-pointer transition-all ${
                  paymentMethod.type === 'bank_slip' 
                    ? 'ring-2 ring-turquoise border-turquoise' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setPaymentMethod({ type: 'bank_slip' })}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center">
                      <FaBarcode className="w-6 h-6 text-coral" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark-gray">Boleto Bancário</h3>
                      <p className="text-sm text-medium-gray">Pagamento em até 3 dias úteis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-light-green/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FaLock className="w-5 h-5 text-turquoise mt-0.5" />
                <div>
                  <h3 className="font-semibold text-dark-gray mb-1">Pagamento 100% Seguro</h3>
                  <p className="text-sm text-medium-gray">
                    Seus dados são protegidos com criptografia SSL e processados por empresas certificadas PCI DSS.
                  </p>
                </div>
              </div>
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

            <div className="space-y-6">
              {/* Resumo do Evento */}
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
                      <h3 className="font-semibold text-dark-gray">{mockEvent.title}</h3>
                      <p className="text-sm text-medium-gray">{formatDate(mockEvent.date)} às {mockEvent.time}</p>
                      <p className="text-sm text-medium-gray">{mockEvent.location.name}, {mockEvent.location.city}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingressos Selecionados */}
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
                      <div key={selection.ticketTypeId} className="flex justify-between items-center py-3 border-b last:border-b-0">
                        <div>
                          <h4 className="font-medium text-dark-gray">{selection.ticketTypeName}</h4>
                          <p className="text-sm text-medium-gray">{selection.quantity}x {formatPrice(selection.unitPrice)}</p>
                        </div>
                        <div className="font-semibold text-dark-gray">
                          {formatPrice(selection.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Comprador</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-medium-gray">Nome:</span>
                      <p className="font-medium text-dark-gray">{customerInfo.firstName} {customerInfo.lastName}</p>
                    </div>
                    <div>
                      <span className="text-medium-gray">E-mail:</span>
                      <p className="font-medium text-dark-gray">{customerInfo.email}</p>
                    </div>
                    <div>
                      <span className="text-medium-gray">Telefone:</span>
                      <p className="font-medium text-dark-gray">{customerInfo.phone}</p>
                    </div>
                    <div>
                      <span className="text-medium-gray">CPF:</span>
                      <p className="font-medium text-dark-gray">{customerInfo.document}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total */}
              <Card className="bg-light-green/20">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="text-dark-gray">Total:</span>
                      <span className="font-bold text-dark-gray">{formatPrice(calculateTotal())}</span>
                    </div>
                    <p className="text-sm text-medium-gray">
                      Pagamento via {paymentMethod.type === 'pix' ? 'PIX' : paymentMethod.type === 'credit_card' ? 'Cartão de Crédito' : 'Boleto'}
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

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return ticketSelections.length > 0;
      case 1:
        return customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone && customerInfo.document;
      case 2:
        return paymentMethod.type;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
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
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {checkoutSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < currentStep 
                        ? 'bg-turquoise text-white' 
                        : index === currentStep 
                        ? 'bg-turquoise/20 text-turquoise border-2 border-turquoise' 
                        : 'bg-light-gray text-medium-gray'
                    }`}>
                      {index < currentStep ? <FaCheck className="w-5 h-5" /> : index + 1}
                    </div>
                    {index < checkoutSteps.length - 1 && (
                      <div className={`w-16 h-1 mx-2 ${
                        index < currentStep ? 'bg-turquoise' : 'bg-light-gray'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                {checkoutSteps.map((step, index) => (
                  <div key={step.id} className="text-center">
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-dark-gray' : 'text-medium-gray'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-medium-gray">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-8">
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
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
                onClick={currentStep === checkoutSteps.length - 1 ? () => {} : nextStep}
                disabled={!canProceed()}
                className="bg-turquoise hover:bg-turquoise/90 text-white"
              >
                {currentStep === checkoutSteps.length - 1 ? 'Finalizar Compra' : 'Continuar'}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="border-0 shadow-md sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Event Info */}
                  <div className="flex space-x-3">
                    <div className="w-16 h-16 bg-light-gray rounded-lg flex items-center justify-center">
                      <span className="text-xl">🎵</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark-gray text-sm">{mockEvent.title}</h3>
                      <p className="text-xs text-medium-gray">{formatDate(mockEvent.date)}</p>
                      <p className="text-xs text-medium-gray">{mockEvent.location.city}</p>
                    </div>
                  </div>

                  {/* Tickets */}
                  <div className="space-y-2">
                    {ticketSelections.map((selection) => (
                      <div key={selection.ticketTypeId} className="flex justify-between text-sm">
                        <span className="text-medium-gray">
                          {selection.quantity}x {selection.ticketTypeName}
                        </span>
                        <span className="text-dark-gray font-medium">
                          {formatPrice(selection.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
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

            {/* Security Info */}
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
