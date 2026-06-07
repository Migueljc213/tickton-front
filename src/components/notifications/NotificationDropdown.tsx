'use client';

import { useState, useEffect, useRef } from 'react';
import { FaBell, FaTicketAlt, FaCalendarAlt, FaCheckCircle, FaCreditCard, FaTimes, FaCheck } from 'react-icons/fa';

export interface Notification {
  id: string;
  type: 'ticket' | 'event' | 'payment' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Pagamento confirmado',
    body: 'Seu ingresso para Festival de Música Eletrônica foi confirmado.',
    time: '2 min atrás',
    read: false,
  },
  {
    id: '2',
    type: 'event',
    title: 'Evento amanhã!',
    body: 'Workshop de Marketing Digital começa amanhã às 09h.',
    time: '1 hora atrás',
    read: false,
  },
  {
    id: '3',
    type: 'ticket',
    title: 'Check-in disponível',
    body: 'Seu QR Code para Conferência de Tecnologia está pronto.',
    time: '3 horas atrás',
    read: false,
  },
  {
    id: '4',
    type: 'system',
    title: 'Bem-vindo ao Ticketon!',
    body: 'Explore eventos incríveis na sua região.',
    time: '1 dia atrás',
    read: true,
  },
];

const TYPE_CONFIG = {
  ticket:  { icon: FaTicketAlt,   bg: '#f0fdfa', color: '#00C2A8' },
  event:   { icon: FaCalendarAlt, bg: '#eff6ff', color: '#3b82f6' },
  payment: { icon: FaCreditCard,  bg: '#f0fdf4', color: '#10b981' },
  system:  { icon: FaCheckCircle, bg: '#faf5ff', color: '#8b5cf6' },
};

interface Props {
  /** Whether the header background is light (scrolled/non-hero) */
  lightBg: boolean;
}

export default function NotificationDropdown({ lightBg }: Props) {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const ref                               = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const dismiss = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const iconClass = lightBg
    ? 'text-gray-500 hover:text-turquoise'
    : 'text-white hover:text-white/80 hover:bg-white/10';

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 rounded-lg flex items-center justify-center relative transition-all hover:bg-gray-100 ${iconClass}`}
        aria-label="Notificações"
      >
        <FaBell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#ef4444', color: 'white',
            fontSize: '10px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: '360px', background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #f1f5f9',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Notificações</p>
              {unreadCount > 0 && (
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ fontSize: '0.78rem', color: '#00C2A8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <FaCheck style={{ fontSize: '0.65rem' }} />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <FaBell style={{ fontSize: '2rem', color: '#d1d5db', marginBottom: '8px' }} />
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      display: 'flex', gap: '12px', padding: '14px 20px',
                      borderBottom: '1px solid #f8fafc',
                      background: n.read ? 'white' : '#fafffe',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'white' : '#fafffe')}
                  >
                    {/* Type icon */}
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ color: cfg.color, fontSize: '0.9rem' }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <p style={{ fontWeight: n.read ? 500 : 700, color: '#111827', fontSize: '0.83rem', lineHeight: 1.3 }}>{n.title}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '2px' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#6b7280')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
                        >
                          <FaTimes style={{ fontSize: '0.7rem' }} />
                        </button>
                      </div>
                      <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '2px', lineHeight: 1.4 }}>{n.body}</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '4px' }}>{n.time}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{ position: 'absolute', top: '18px', right: '12px', width: '7px', height: '7px', borderRadius: '50%', background: '#00C2A8' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <button style={{ fontSize: '0.8rem', color: '#00C2A8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
