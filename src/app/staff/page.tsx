'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaShieldAlt,
  FaQrcode,
  FaCrown,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
} from 'react-icons/fa';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Assignment {
  collaboratorId: number;
  role: 'SCANNER' | 'CO_ORGANIZER';
  eventId: number;
  eventTitle: string;
  eventDate: string;
  venueName: string | null;
  city: string | null;
  state: string | null;
  bannerUrl: string | null;
  organizerId: number;
}

function parseCover(url: string | null) {
  if (!url) return null;
  try {
    const arr = JSON.parse(url);
    if (Array.isArray(arr) && arr[0]) return arr[0] as string;
  } catch {}
  return url;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function RoleBadge({ role }: { role: string }) {
  const isCo = role === 'CO_ORGANIZER';
  return (
    <span
      style={{
        background: isCo ? '#003B4A' : '#00C2A8',
        color: '#fff',
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 20,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {isCo ? <FaCrown style={{ fontSize: '0.6rem' }} /> : <FaQrcode style={{ fontSize: '0.6rem' }} />}
      {isCo ? 'Co-organizador' : 'Scanner'}
    </span>
  );
}

export default function StaffAssignmentsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = getToken();

  useEffect(() => {
    if (!token) { router.push('/login'); return; }

    fetch(`${API_URL}/event-collaborators/my/assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch(() => setError('Erro ao carregar atribuições.'))
      .finally(() => setLoading(false));
  }, [token, router]);

  const upcoming = assignments.filter((a) => new Date(a.eventDate) >= new Date());
  const past     = assignments.filter((a) => new Date(a.eventDate) < new Date());

  return (
    <DashboardLayout userRole="participant">
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)', color: '#fff', padding: '32px 24px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaShieldAlt style={{ fontSize: '1.4rem' }} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Minha Equipe</h1>
                <p style={{ margin: 0, opacity: 0.75, fontSize: '0.875rem' }}>
                  Eventos onde você está na equipe de portaria
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

          {loading && (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0' }}>Carregando...</p>
          )}

          {error && (
            <p style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 12, padding: '14px 16px', fontSize: '0.875rem' }}>
              {error}
            </p>
          )}

          {!loading && assignments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <FaShieldAlt style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: 16 }} />
              <h2 style={{ color: '#0f172a', marginBottom: 8 }}>Nenhuma atribuição ainda</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Quando um organizador te adicionar como colaborador de um evento,
                ele vai aparecer aqui.
              </p>
            </div>
          )}

          {upcoming.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                Próximos eventos ({upcoming.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {upcoming.map((a) => {
                  const cover = parseCover(a.bannerUrl);
                  return (
                    <div
                      key={a.collaboratorId}
                      style={{
                        background: '#fff',
                        borderRadius: 16,
                        overflow: 'hidden',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                      }}
                    >
                      {/* Cover thumb */}
                      <div
                        style={{
                          width: 100,
                          flexShrink: 0,
                          background: cover ? `url(${cover}) center/cover` : 'linear-gradient(135deg, #003B4A, #00C2A8)',
                        }}
                      />

                      <div style={{ flex: 1, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{a.eventTitle}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                              <FaCalendarAlt style={{ fontSize: '0.7rem', color: '#64748b' }} />
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{formatDate(a.eventDate)}</span>
                            </div>
                            {(a.venueName || a.city) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                                <FaMapMarkerAlt style={{ fontSize: '0.7rem', color: '#64748b' }} />
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  {[a.venueName, a.city, a.state].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                          <RoleBadge role={a.role} />
                        </div>

                        <Link
                          href={`/checkin/${a.eventId}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            marginTop: 10,
                            background: '#00C2A8',
                            color: '#fff',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          <FaQrcode /> Abrir Portaria <FaArrowRight style={{ fontSize: '0.7rem' }} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b', marginBottom: 14 }}>
                Eventos passados ({past.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {past.map((a) => (
                  <div
                    key={a.collaboratorId}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      padding: '14px 16px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      opacity: 0.75,
                    }}
                  >
                    <FaCalendarAlt style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.eventTitle}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{formatDate(a.eventDate)}</p>
                    </div>
                    <RoleBadge role={a.role} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
