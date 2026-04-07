import { useState, useEffect, useCallback } from 'react';
import { eventsService } from '@/lib/api/services';
import { extractErrorMessage } from '@/lib/utils/error-handler';
import type { Event, CreateEventRequest, UpdateEventRequest, SearchEventsParams } from '@/types/api';

const DEFAULT_ERROR_MESSAGES = {
  FETCH: 'Failed to fetch events',
  SEARCH: 'Failed to search events',
  CREATE: 'Failed to create event',
  UPDATE: 'Failed to update event',
  DELETE: 'Failed to delete event',
} as const;

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsService.getAllEvents();
      setEvents(response.events);
    } catch (err) {
      setError(extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.FETCH);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const searchEvents = useCallback(async (params: SearchEventsParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsService.searchEvents(params);
      setEvents(response.events);
    } catch (err) {
      setError(extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.SEARCH);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (data: CreateEventRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newEvent = await eventsService.createEvent(data);
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.CREATE;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (id: number, data: UpdateEventRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedEvent = await eventsService.updateEvent(id, data);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      return updatedEvent;
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.UPDATE;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await eventsService.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      const errorMessage = extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.DELETE;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    searchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};

export const useEvent = (id: number | null) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await eventsService.getEventById(id);
      setEvent(data);
    } catch (err) {
      setError(extractErrorMessage(err) || DEFAULT_ERROR_MESSAGES.FETCH);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
};
