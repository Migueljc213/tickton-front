'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaComments,
  FaLock,
  FaPaperPlane,
  FaSpinner,
  FaTicketAlt,
} from 'react-icons/fa';
import { storage } from '@/lib/utils/storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';


interface EventPost {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

type AccessState =
  | 'idle'          // not yet resolved
  | 'unauthenticated'
  | 'checking'
  | 'granted'
  | 'denied';

interface Props {
  eventId: number;
}


function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'agora mesmo';
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}


function PostCard({ post, isOwn }: { post: EventPost; isOwn: boolean }) {
  return (
    <li
      style={{
        background: '#F5F7F8',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: isOwn ? '#00C2A8' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#fff',
        }}
      >
        {initials(post.userName)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#0f172a',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {post.userName}
          </span>
          {isOwn && (
            <span
              style={{
                fontSize: '0.7rem',
                background: '#00C2A8',
                color: '#fff',
                borderRadius: 99,
                padding: '1px 7px',
                fontWeight: 600,
              }}
            >
              você
            </span>
          )}
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            {relativeTime(post.createdAt)}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#374151',
            lineHeight: 1.5,
            wordBreak: 'break-word',
          }}
        >
          {post.content}
        </p>
      </div>
    </li>
  );
}

function AccessMessage({
  access,
  onLoginClick,
}: {
  access: AccessState;
  onLoginClick?: () => void;
}) {
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    borderRadius: 10,
    fontSize: '0.875rem',
    marginBottom: 16,
  };

  if (access === 'unauthenticated') {
    return (
      <div style={{ ...base, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
        <FaLock style={{ flexShrink: 0, color: 'rgba(255,255,255,0.4)' }} />
        <span>
          <button
            onClick={onLoginClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#00C2A8',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
              fontSize: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Faça login
          </button>{' '}
          para ver o mural do evento.
        </span>
      </div>
    );
  }

  if (access === 'checking') {
    return (
      <div style={{ ...base, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
        <FaSpinner className="animate-spin" style={{ flexShrink: 0 }} />
        Verificando seu acesso...
      </div>
    );
  }

  if (access === 'denied') {
    return (
      <div style={{ ...base, background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.55)' }}>
        <FaTicketAlt style={{ flexShrink: 0, color: 'rgba(255,255,255,0.3)' }} />
        Apenas participantes confirmados podem interagir neste mural.
      </div>
    );
  }

  return null;
}


export default function EventWall({ eventId }: Props) {
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [access, setAccess] = useState<AccessState>('idle');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = storage.getUserId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load posts (public)
  useEffect(() => {
    fetch(`${API_URL}/event-posts/event/${eventId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [eventId]);

  // Check if logged-in user has a confirmed ticket for this event
  useEffect(() => {
    const token = storage.getToken();
    if (!token) {
      setAccess('unauthenticated');
      return;
    }

    setAccess('checking');
    fetch(`${API_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { setAccess('denied'); return; }
        const orders: Array<{ eventId: number; status: string }> =
          Array.isArray(data) ? data : (data?.orders ?? []);
        const hasPaid = orders.some(
          (o) => o.eventId === eventId && o.status === 'paid',
        );
        setAccess(hasPaid ? 'granted' : 'denied');
      })
      .catch(() => setAccess('denied'));
  }, [eventId]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = content.trim();
      if (!trimmed) return;

      const token = storage.getToken();
      if (!token) return;

      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/event-posts/event/${eventId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: trimmed }),
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          // Array de mensagens do class-validator → join
          const msg: string = Array.isArray(d.message)
            ? d.message.join(', ')
            : (d.message ?? 'Erro ao publicar comentário.');
          throw new Error(msg);
        }

        const newPost: EventPost = await res.json();
        setPosts((prev) => [newPost, ...prev]);
        setContent('');
        textareaRef.current?.focus();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado.');
      } finally {
        setSubmitting(false);
      }
    },
    [content, eventId],
  );

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <section
      aria-label="Mural do evento"
      style={{
        background: '#003B4A',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <FaComments style={{ color: '#00C2A8', fontSize: '1.1rem' }} />
        <h2
          style={{
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.05rem',
            margin: 0,
            flex: 1,
          }}
        >
          Mural do Evento
        </h2>
        {!postsLoading && (
          <span
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.45)',
              fontWeight: 500,
            }}
          >
            {posts.length} comentário{posts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={{ padding: '20px 24px' }}>

        {/* ── Access Gate ── */}
        {access !== 'granted' && (
          <AccessMessage
            access={access}
            onLoginClick={() => window.location.assign('/login')}
          />
        )}

        {/* ── Compose Form (only for confirmed buyers) ── */}
        {access === 'granted' && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
            {error && (
              <p
                style={{
                  color: '#fca5a5',
                  fontSize: '0.8rem',
                  marginBottom: 8,
                  marginTop: 0,
                }}
              >
                {error}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
              }}
            >
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextareaChange}
                placeholder="Compartilhe sua experiência com os outros participantes…"
                rows={2}
                maxLength={1000}
                disabled={submitting}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.875rem',
                  resize: 'none',
                  outline: 'none',
                  minHeight: 60,
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#00C2A8')}
                onBlur={(e) =>
                  (e.target.style.borderColor = 'rgba(255,255,255,0.15)')
                }
              />
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                style={{
                  background: '#00C2A8',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
                  opacity: submitting || !content.trim() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  transition: 'opacity 0.15s',
                  flexShrink: 0,
                  height: 42,
                }}
                title="Publicar comentário"
              >
                {submitting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
                <span className="hidden sm:inline">Publicar</span>
              </button>
            </div>
            {content.length > 900 && (
              <p
                style={{
                  textAlign: 'right',
                  fontSize: '0.75rem',
                  color: content.length >= 1000 ? '#fca5a5' : 'rgba(255,255,255,0.45)',
                  margin: '4px 0 0',
                }}
              >
                {content.length}/1000
              </p>
            )}
          </form>
        )}

        {/* ── Posts List ── */}
        {postsLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 0',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <FaSpinner
              className="animate-spin"
              style={{ fontSize: '1.4rem', marginBottom: 8, display: 'block', margin: '0 auto 8px' }}
            />
            <span style={{ fontSize: '0.85rem' }}>
              Carregando comentários…
            </span>
          </div>
        ) : posts.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.875rem',
              padding: '16px 0',
              margin: 0,
            }}
          >
            Nenhum comentário ainda. Seja o primeiro a interagir!
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwn={post.userId === currentUserId}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
