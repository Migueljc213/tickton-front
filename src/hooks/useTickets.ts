import { useState, useCallback } from 'react';
import { ticketsService } from '@/lib/api/services';
import { extractErrorMessage } from '@/lib/utils/error-handler';
import type { Ticket, CreateTicketRequest, UpdateTicketRequest } from '@/types/api';

const DEFAULT_ERROR_MESSAGES = {
  FETCH: 'Failed to fetch tickets',
  CREATE: 'Failed to create ticket',
  UPDATE: 'Failed to update ticket',
  DELETE: 'Failed to delete ticket',
} as const;

export const useTickets = (eventId?: number) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await ticketsService.getTicketsByEventId(eventId);
      // Backend returns Ticket[] directly; service type says { tickets: Ticket[] } — handle both
      const list = Array.isArray(response) ? response : (response.tickets ?? []);
      setTickets(list);
    } catch (err) {
      setError(extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.FETCH);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const createTicket = useCallback(async (data: CreateTicketRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newTicket = await ticketsService.createTicket(data);
      setTickets(prev => [...prev, newTicket]);
      return newTicket;
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.CREATE;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTicket = useCallback(async (id: number, data: UpdateTicketRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTicket = await ticketsService.updateTicket(id, data);
      setTickets(prev => prev.map(ticket => ticket.id === id ? updatedTicket : ticket));
      return updatedTicket;
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.UPDATE;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTicket = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await ticketsService.deleteTicket(id);
      setTickets(prev => prev.filter(ticket => ticket.id !== id));
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.DELETE;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
  };
};
