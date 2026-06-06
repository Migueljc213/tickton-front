'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaCheckCircle,
  FaTicketAlt,
  FaUsers,
} from 'react-icons/fa';
import EventCard from '@/components/events/EventCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Organizer {
  id: number;
  companyName: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  city?: string;
  state?: string;
  isVerified: boolean;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  category: string;
  eventDate: string;
  venueName?: string;
  city?: string;
  state?: string;
  bannerUrl?: string;
  isPublished: boolean;
  status: string;
}

export default function OrganizerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const organizerId = params?.id ? parseInt(params.id as string, 10) : null;

  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!organizerId) return;

    Promise.all([
      fetch(`${API_URL}/organizers/${organizerId}`).then((r) => r.json()),
      fetch(`${API_URL}/events`).then((r) => r.json()),
    ])
      .then(([orgData, eventsData]) => {
        setOrganizer(orgData.organizer ?? orgData);
        const allEvents: Event[] = eventsData.events ?? eventsData ?? [];
        setEvents(allEvents.filter((e) => (e as any).organizerId === organizerId && e.isPublished));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [organizerId]);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.eventDate) >= now);
  const past = events.filter((e) => new Date(e.eventDate) < now);
  const displayed = tab === 'upcoming' ? upcoming : past;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Organizador não encontrado.</p>
          <button onClick={() => router.push('/events')}
            className="px-5 py-2.5 text-white rounded-xl font-medium"
            style={{ backgroundColor: '#00C2A8' }}>
            Ver Eventos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-12" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 text-sm">
            <FaArrowLeft /> Voltar
          </button>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black bg-white/20 shrink-0">
              {organizer.logoUrl ? (
                <img src={organizer.logoUrl} alt={organizer.companyName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                organizer.companyName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black">{organizer.companyName}</h1>
                {organizer.isVerified && (
                  <FaCheckCircle className="text-[#00C2A8] text-lg" title="Organizador verificado" />
                )}
              </div>

              {(organizer.city || organizer.state) && (
                <p className="text-white/70 text-sm flex items-center gap-1 mb-2">
                  <FaMapMarkerAlt className="text-xs" />
                  {[organizer.city, organizer.state].filter(Boolean).join(', ')}
                </p>
              )}

              {organizer.description && (
                <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
                  {organizer.description}
                </p>
              )}

              {organizer.website && (
                <a href={organizer.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white mt-2 transition-colors">
                  <FaGlobe /> {organizer.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: <FaCalendarAlt />, label: 'Eventos', value: events.length },
              { icon: <FaTicketAlt />, label: 'Próximos', value: upcoming.length },
              { icon: <FaUsers />, label: 'Passados', value: past.length },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-white/60 flex justify-center mb-1">{s.icon}</div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 w-fit mb-6">
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'upcoming' ? `Próximos (${upcoming.length})` : `Passados (${past.length})`}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">
              {tab === 'upcoming' ? 'Nenhum evento próximo.' : 'Nenhum evento passado.'}
            </p>
            {tab === 'upcoming' && (
              <Link href="/events" className="inline-block mt-4 text-sm font-semibold" style={{ color: '#00C2A8' }}>
                Explorar outros eventos →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((event) => (
              <EventCard key={event.id} event={event as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
