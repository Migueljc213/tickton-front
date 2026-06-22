'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import Carousel from '@/components/ui/carousel';
import EventCard from '@/components/events/EventCard';
import { adaptApiEvent } from '@/lib/utils/adapt-events';
import type { Event as ApiEvent } from '@/types/api';
import type { Event as CardEvent } from '@/types/event';

type GeoStatus = 'idle' | 'requesting' | 'found' | 'denied' | 'error';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; state: string } | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'pt-BR' } },
    );
    if (!r.ok) return null;
    const data = await r.json();
    const addr = data.address ?? {};
    const city  = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
    const state = addr['ISO3166-2-lvl4']?.split('-')[1] ?? addr.state_code ?? '';
    return city ? { city, state } : null;
  } catch { return null; }
}

interface Props {
  fallbackEvents: CardEvent[];
}

export default function HomeNearbyEvents({ fallbackEvents }: Props) {
  const [nearbyEvents, setNearbyEvents] = useState<CardEvent[]>([]);
  const [geoStatus, setGeoStatus]       = useState<GeoStatus>('idle');
  const [userCity, setUserCity]         = useState('');
  const [userState, setUserState]       = useState('');

  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (!geo) { setGeoStatus('error'); return; }
        setUserCity(geo.city);
        setUserState(geo.state);
        try {
          const params = new URLSearchParams({ isPublished: 'true', city: geo.city });
          if (geo.state) params.set('state', geo.state);
          const r = await fetch(`${API_URL}/events?${params}`);
          if (r.ok) {
            const data = await r.json();
            const list: ApiEvent[] = Array.isArray(data) ? data : (data.events ?? []);
            setNearbyEvents(list.map(adaptApiEvent));
          }
        } catch { /* silently fall back */ }
        setGeoStatus('found');
      },
      () => setGeoStatus('denied'),
      { timeout: 8000 },
    );
  }, []);

  const displayed = geoStatus === 'found' ? nearbyEvents.slice(0, 8) : fallbackEvents.slice(0, 8);

  const subtitle =
    geoStatus === 'requesting' ? 'Localizando sua cidade...' :
    geoStatus === 'found'      ? `Eventos em ${userCity}${userState ? `, ${userState}` : ''}` :
    geoStatus === 'denied'     ? 'Permita o acesso à localização para ver eventos próximos' :
    'Descubra eventos incríveis na sua região';

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <Carousel
          title="Próximos de Você"
          subtitle={subtitle}
          headerRight={
            geoStatus === 'requesting' ? (
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <FaSpinner className="animate-spin text-turquoise" />
                Detectando localização...
              </span>
            ) : geoStatus === 'found' ? (
              <span className="flex items-center gap-2 text-sm text-turquoise font-medium">
                <FaMapMarkerAlt />
                {userCity}{userState ? `, ${userState}` : ''}
              </span>
            ) : null
          }
        >
          {geoStatus === 'requesting' ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[280px] h-[360px] bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))
          ) : displayed.length > 0 ? (
            displayed.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="w-full py-10 text-center text-gray-400 text-sm">
              Nenhum evento encontrado na sua região.{' '}
              <Link href="/events" className="text-turquoise underline">Ver todos os eventos</Link>
            </div>
          )}
        </Carousel>
      </div>
    </section>
  );
}
