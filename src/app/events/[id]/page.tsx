'use client';

import { useState } from 'react';
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
  FaCheck,
  FaTicketAlt,
  FaShieldAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe
} from 'react-icons/fa';
import { Event, Ticket } from '@/types/event';

// Mock data - em produção viria de uma API
const mockEvent: Event = {
  id: '1',
  title: 'Festival de Música Eletrônica 2025',
  description: `
    O Festival de Música Eletrônica 2025 promete ser uma experiência única e inesquecível! 
    Prepare-se para uma noite repleta de energia, batidas eletrônicas e performances de tirar o fôlego.
    
    **O que esperar:**
    - Mais de 20 DJs nacionais e internacionais
    - 3 palcos simultâneos com diferentes estilos musicais
    - Área VIP com vista privilegiada
    - Food trucks com gastronomia variada
    - Área de descanso e hidratação
    - Estacionamento gratuito
    
    **Line-up confirmado:**
    - DJ Snake (Internacional)
    - Alok (Brasil)
    - Vintage Culture (Brasil)
    - Fisher (Austrália)
    - E muito mais!
    
    Este é o maior evento de música eletrônica do ano. Não perca!
  `,
  date: '2025-03-15',
  time: '20:00',
  location: {
    name: 'Parque Ibirapuera',
    address: 'Av. Pedro Álvares Cabral, s/n - Vila Mariana',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '04094-050',
    capacity: 50000
  },
  image: '/api/placeholder/800/400',
  category: 'music',
  type: 'paid',
  organizer: {
    id: '1',
    name: 'Eventos SP',
    email: 'contato@eventossp.com.br',
    phone: '(11) 99999-9999',
  },
  tickets: [
    {
      id: '1',
      name: 'Pista',
      price: 120,
      quantity: 1000,
      sold: 750,
      isActive: true
    },
    {
      id: '2',
      name: 'VIP',
      price: 250,
      quantity: 200,
      sold: 120,
      isActive: true
    },
    {
      id: '3',
      name: 'Meia Entrada',
      price: 60,
      quantity: 100,
      sold: 45,
      isActive: true
    }
  ],
  status: 'active',
  featured: true,
  tags: ['música eletrônica', 'festival', 'DJs', 'São Paulo'],
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01'
};

export default function EventDetailsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateTotal = () => {
    if (!selectedTicket) return 0;
    return selectedTicket.price * ticketQuantity;
  };

  const getAvailableQuantity = (ticket: Ticket) => {
    return ticket.quantity - ticket.sold;
  };

  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6 text-medium-gray hover:text-turquoise"
        >
          <FaArrowLeft className="mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Images */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-light-gray relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">🎵</span>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-dark-gray mb-2">
                    {mockEvent.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-medium-gray">
                    <div className="flex items-center">
                      <FaCalendarAlt className="w-4 h-4 mr-2" />
                      {formatDate(mockEvent.date)}
                    </div>
                    <div className="flex items-center">
                      <FaClock className="w-4 h-4 mr-2" />
                      {mockEvent.time}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <FaHeart />
                  </Button>
                  <Button variant="outline" size="icon">
                    <FaShare />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="w-5 h-5 text-turquoise mt-1" />
                  <div>
                    <h3 className="font-semibold text-dark-gray">Local</h3>
                    <p className="text-medium-gray">{mockEvent.location.name}</p>
                    <p className="text-medium-gray text-sm">{mockEvent.location.address}</p>
                    <p className="text-medium-gray text-sm">{mockEvent.location.city}, {mockEvent.location.state}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaUsers className="w-5 h-5 text-turquoise mt-1" />
                  <div>
                    <h3 className="font-semibold text-dark-gray">Organizador</h3>
                    <p className="text-medium-gray">{mockEvent.organizer.name}</p>
                    <div className="flex space-x-2 mt-1">
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <FaPhone className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <FaEnvelope className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <FaGlobe className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {mockEvent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-light-green/20 text-dark-blue px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-dark-gray mb-4">Sobre o Evento</h2>
              <div className="prose prose-gray max-w-none">
                {mockEvent.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-medium-gray mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-dark-gray mb-4">Informações do Evento</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-dark-gray mb-2">Política de Reembolso</h3>
                  <p className="text-medium-gray">Cancelamento e reembolso permitidos até 7 dias antes do evento. Taxa administrativa de 10%.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-dark-gray mb-2">Restrição de Idade</h3>
                  <p className="text-medium-gray">Evento para maiores de 18 anos. Documento de identidade obrigatório.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-dark-gray mb-2">Código de Vestimenta</h3>
                  <p className="text-medium-gray">Traje livre. Recomendamos roupas confortáveis e tênis.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket Selection */}
          <div className="space-y-6">
            {/* Ticket Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-dark-gray mb-4">Selecionar Ingressos</h2>
              
              <div className="space-y-4">
                {mockEvent.tickets.map((ticket) => {
                  const available = getAvailableQuantity(ticket);
                  const isSoldOut = available <= 0;
                  
                  return (
                    <Card 
                      key={ticket.id} 
                      className={`cursor-pointer transition-all ${
                        selectedTicket?.id === ticket.id 
                          ? 'ring-2 ring-turquoise border-turquoise' 
                          : 'hover:shadow-md'
                      } ${isSoldOut ? 'opacity-50' : ''}`}
                      onClick={() => !isSoldOut && setSelectedTicket(ticket)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{ticket.name}</CardTitle>
                            <p className="text-sm text-medium-gray mt-1">Ingresso disponível</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-turquoise">
                              {formatPrice(ticket.price)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-medium-gray">Disponível:</span>
                            <span className={isSoldOut ? 'text-coral' : 'text-dark-gray'}>
                              {isSoldOut ? 'Esgotado' : `${available} ingressos`}
                            </span>
                          </div>
                          
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quantity and Total */}
              {selectedTicket && (
                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-gray mb-2">
                        Quantidade
                      </label>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                          disabled={ticketQuantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center font-medium">{ticketQuantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setTicketQuantity(Math.min(getAvailableQuantity(selectedTicket), ticketQuantity + 1))}
                          disabled={ticketQuantity >= getAvailableQuantity(selectedTicket)}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="bg-light-gray/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-medium-gray">Subtotal:</span>
                        <span className="font-medium">{formatPrice(selectedTicket.price * ticketQuantity)}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold text-dark-gray">
                        <span>Total:</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-turquoise hover:bg-turquoise/90 text-white py-3">
                      <FaTicketAlt className="mr-2" />
                      Comprar Ingressos
                    </Button>

                    <div className="flex items-center text-sm text-medium-gray">
                      <FaShieldAlt className="w-4 h-4 mr-2" />
                      Compra 100% segura
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Share */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-dark-gray mb-4">Compartilhar Evento</h3>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" className="flex-1">
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Facebook
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Twitter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
