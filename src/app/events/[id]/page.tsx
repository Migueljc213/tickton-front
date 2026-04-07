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
} from 'react-icons/fa';
import { useEvent, useTickets } from '@/hooks';
import { formatPrice, formatLongDate, formatTime } from '@/lib/utils/format';
import type { Ticket } from '@/types/api';

const CHECKOUT_PATH = '/checkout';
const EVENTS_PATH = '/events';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id ? parseInt(params.id as string, 10) : null;
  
  const { event, loading: eventLoading, error: eventError } = useEvent(eventId);
  const { tickets, loading: ticketsLoading, fetchTickets } = useTickets(eventId || undefined);
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);

  useEffect(() => {
    if (eventId) {
      fetchTickets();
    }
  }, [eventId, fetchTickets]);

  const getAvailableQuantity = (ticket: Ticket) => {
    return ticket.quantityAvailable - ticket.quantitySold;
  };

  const calculateTotal = () => {
    if (!selectedTicket) return 0;
    return Number(selectedTicket.price) * ticketQuantity;
  };

  const handleBuyTickets = () => {
    if (!selectedTicket || !eventId) return;
    router.push(`${CHECKOUT_PATH}?eventId=${eventId}&ticketId=${selectedTicket.id}&quantity=${ticketQuantity}`);
  };

  const handleDecreaseQuantity = () => {
    setTicketQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    if (!selectedTicket) return;
    const maxQuantity = getAvailableQuantity(selectedTicket);
    setTicketQuantity(prev => Math.min(maxQuantity, prev + 1));
  };

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketQuantity(1);
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-light-gray/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-medium-gray text-lg">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-light-gray/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">Erro ao carregar evento</p>
            <Button onClick={() => router.push(EVENTS_PATH)}>
              Voltar para Eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasTickets = tickets.length > 0;
  const venueInfo = event.venueName || event.address || 'Local a definir';
  const locationInfo = [venueInfo, event.city, event.state].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-light-gray/30">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(EVENTS_PATH)}
          className="mb-6 text-medium-gray hover:text-turquoise"
        >
          <FaArrowLeft className="mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-light-gray relative">
                {event.bannerUrl ? (
                  <img 
                    src={event.bannerUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🎵</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-dark-gray mb-2">
                    {event.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-medium-gray">
                    <div className="flex items-center">
                      <FaCalendarAlt className="w-4 h-4 mr-2" />
                      {formatLongDate(event.eventDate)}
                    </div>
                    <div className="flex items-center">
                      <FaClock className="w-4 h-4 mr-2" />
                      {formatTime(event.eventDate)}
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
                    <p className="text-medium-gray">{locationInfo}</p>
                  </div>
                </div>

                {event.maxAttendees && (
                  <div className="flex items-start space-x-3">
                    <FaUsers className="w-5 h-5 text-turquoise mt-1" />
                    <div>
                      <h3 className="font-semibold text-dark-gray">Capacidade</h3>
                      <p className="text-medium-gray">Até {event.maxAttendees} participantes</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <span className="bg-turquoise/15 text-turquoise-800 px-4 py-2 rounded-full text-sm font-semibold">
                  {event.category}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-dark-gray mb-4">Sobre o Evento</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-medium-gray whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-dark-gray mb-4">Selecionar Ingressos</h2>
              
              {ticketsLoading ? (
                <div className="text-center py-8">
                  <p className="text-medium-gray">Carregando ingressos...</p>
                </div>
              ) : !hasTickets ? (
                <div className="text-center py-8">
                  <p className="text-medium-gray">Nenhum ingresso disponível</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {tickets.map((ticket) => {
                      const available = getAvailableQuantity(ticket);
                      const isSoldOut = available <= 0 || !ticket.isActive;
                      const isSelected = selectedTicket?.id === ticket.id;

                      return (
                        <Card 
                          key={ticket.id} 
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'ring-2 ring-turquoise border-turquoise' 
                              : 'hover:shadow-md'
                          } ${isSoldOut ? 'opacity-50' : ''}`}
                          onClick={() => !isSoldOut && handleTicketSelect(ticket)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{ticket.name}</CardTitle>
                                {ticket.description && (
                                  <p className="text-sm text-medium-gray mt-1">{ticket.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-turquoise">
                                  {formatPrice(Number(ticket.price))}
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
                              onClick={handleDecreaseQuantity}
                              disabled={ticketQuantity <= 1}
                            >
                              -
                            </Button>
                            <span className="w-12 text-center font-medium">{ticketQuantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleIncreaseQuantity}
                              disabled={ticketQuantity >= getAvailableQuantity(selectedTicket)}
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div className="bg-light-gray/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-medium-gray">Subtotal:</span>
                            <span className="font-medium">
                              {formatPrice(Number(selectedTicket.price) * ticketQuantity)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-bold text-dark-gray">
                            <span>Total:</span>
                            <span>{formatPrice(calculateTotal())}</span>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-turquoise hover:bg-turquoise/90 text-white py-3"
                          onClick={handleBuyTickets}
                        >
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
