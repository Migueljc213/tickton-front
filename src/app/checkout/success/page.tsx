'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FaCheckCircle, 
  FaDownload, 
  FaTicketAlt, 
  FaCalendarAlt, 
  FaMapMarkerAlt,
  FaQrcode,
  FaShare,
  FaEnvelope,
  FaHome,
  FaPhone
} from 'react-icons/fa';

// Mock data - em produção viria de uma API
const mockOrder = {
  id: 'ORD-2025-001234',
  event: {
    title: 'Festival de Música Eletrônica 2025',
    date: '2025-03-15',
    time: '20:00',
    location: {
      name: 'Parque Ibirapuera',
      address: 'Av. Pedro Álvares Cabral, s/n - Vila Mariana',
      city: 'São Paulo',
      state: 'SP'
    }
  },
  tickets: [
    {
      id: 'TKT-001',
      type: 'Pista',
      quantity: 2,
      price: 120,
      qrCode: 'QR_CODE_BASE64_DATA'
    }
  ],
  customer: {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999'
  },
  total: 240,
  paymentMethod: 'pix',
  purchaseDate: '2025-01-27T10:30:00Z'
};

export default function CheckoutSuccessPage() {
  const [showQRCode, setShowQRCode] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-dark-gray mb-4">
            Compra Realizada com Sucesso!
          </h1>
          <p className="text-xl text-medium-gray max-w-2xl mx-auto">
            Seus ingressos foram confirmados e enviados por e-mail. 
            Você também pode acessá-los na sua conta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Confirmation */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaTicketAlt className="mr-2 text-turquoise" />
                  Confirmação do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-medium-gray">Número do Pedido:</span>
                    <span className="font-semibold text-dark-gray">{mockOrder.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-medium-gray">Data da Compra:</span>
                    <span className="font-semibold text-dark-gray">{formatDateTime(mockOrder.purchaseDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-medium-gray">Método de Pagamento:</span>
                    <span className="font-semibold text-dark-gray capitalize">
                      {mockOrder.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-medium-gray">Total Pago:</span>
                    <span className="text-xl font-bold text-turquoise">
                      {formatPrice(mockOrder.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-turquoise" />
                  Detalhes do Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-light-gray rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-dark-gray mb-2">
                        {mockOrder.event.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-medium-gray">
                          <FaCalendarAlt className="w-4 h-4 mr-2" />
                          {formatDate(mockOrder.event.date)} às {mockOrder.event.time}
                        </div>
                        <div className="flex items-center text-medium-gray">
                          <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                          {mockOrder.event.location.name}
                        </div>
                        <div className="text-medium-gray ml-6">
                          {mockOrder.event.location.address}
                        </div>
                        <div className="text-medium-gray ml-6">
                          {mockOrder.event.location.city}, {mockOrder.event.location.state}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Seus Ingressos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrder.tickets.map((ticket) => (
                    <div key={ticket.id} className="border border-light-gray rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-dark-gray">{ticket.type}</h4>
                          <p className="text-sm text-medium-gray">
                            {ticket.quantity} ingresso{ticket.quantity > 1 ? 's' : ''} • {formatPrice(ticket.price)} cada
                          </p>
                          <p className="text-sm text-medium-gray mt-1">
                            Código do ingresso: {ticket.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-dark-gray">
                            {formatPrice(ticket.price * ticket.quantity)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowQRCode(!showQRCode)}
                          className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white"
                        >
                          <FaQrcode className="mr-2" />
                          {showQRCode ? 'Ocultar' : 'Mostrar'} QR Code
                        </Button>
                        <Button variant="outline" size="sm">
                          <FaDownload className="mr-2" />
                          Baixar PDF
                        </Button>
                        <Button variant="outline" size="sm">
                          <FaShare className="mr-2" />
                          Compartilhar
                        </Button>
                      </div>

                      {showQRCode && (
                        <div className="mt-4 p-4 bg-white border border-light-gray rounded-lg">
                          <div className="text-center">
                            <div className="w-32 h-32 bg-light-gray rounded-lg mx-auto mb-3 flex items-center justify-center">
                              <span className="text-xs text-medium-gray">QR Code</span>
                            </div>
                            <p className="text-sm text-medium-gray">
                              Mostre este QR Code na entrada do evento
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-0 shadow-md bg-light-green/20">
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-turquoise rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-gray">Confirmação por E-mail</h4>
                      <p className="text-sm text-medium-gray">
                        Você receberá um e-mail de confirmação com todos os detalhes do seu pedido.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-turquoise rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-gray">Adicionar ao Calendário</h4>
                      <p className="text-sm text-medium-gray">
                        Adicione o evento ao seu calendário para não esquecer a data.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-turquoise rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-gray">Chegada no Evento</h4>
                      <p className="text-sm text-medium-gray">
                        Chegue com pelo menos 30 minutos de antecedência e tenha seu QR Code em mãos.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-turquoise hover:bg-turquoise/90 text-white">
                  <FaTicketAlt className="mr-2" />
                  Ver Meus Ingressos
                </Button>
                <Button variant="outline" className="w-full border-turquoise text-turquoise hover:bg-turquoise hover:text-white">
                  <FaEnvelope className="mr-2" />
                  Reenviar por E-mail
                </Button>
                <Button variant="outline" className="w-full border-light-green text-dark-blue hover:bg-light-green hover:text-dark-gray">
                  <FaCalendarAlt className="mr-2" />
                  Adicionar ao Calendário
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FaPhone className="w-5 h-5 text-turquoise mt-0.5" />
                    <div>
                      <p className="font-medium text-dark-gray">Telefone</p>
                      <p className="text-sm text-medium-gray">(11) 99999-9999</p>
                      <p className="text-xs text-medium-gray">Seg - Sex: 9h às 18h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FaEnvelope className="w-5 h-5 text-turquoise mt-0.5" />
                    <div>
                      <p className="font-medium text-dark-gray">E-mail</p>
                      <p className="text-sm text-medium-gray">suporte@galliard.com.br</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full border-coral text-coral hover:bg-coral hover:text-white">
                    Central de Ajuda
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share Event */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Compartilhar Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white">
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600 border-gray-600 hover:bg-gray-600 hover:text-white">
                    Copiar Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="text-center mt-12 space-y-4">
          <Button 
            size="lg" 
            className="bg-turquoise hover:bg-turquoise/90 text-white mr-4"
          >
            <FaHome className="mr-2" />
            Voltar ao Início
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-turquoise text-turquoise hover:bg-turquoise hover:text-white"
          >
            <FaTicketAlt className="mr-2" />
            Ver Todos os Meus Ingressos
          </Button>
        </div>
      </div>
    </div>
  );
}
