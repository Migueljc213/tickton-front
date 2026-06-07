'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FaUsers,
  FaCalendarAlt,
  FaDollarSign,
  FaChartLine,
  FaTicketAlt,
  FaEye,
  FaEdit,
  FaPlus,
  FaDownload,
  FaSearch,
  FaCrown,
  FaShieldAlt,
  FaBan,
  FaCheck,
  FaTimes,
  FaArrowUp,
} from 'react-icons/fa';

const mockStats = {
  totalUsers: 15420,
  activeEvents: 234,
  totalRevenue: 2847560,
  totalTicketsSold: 45680,
  newUsersThisMonth: 1234,
  eventsThisMonth: 45,
  revenueThisMonth: 456780,
  averageTicketPrice: 62.3,
};

const mockUsers = [
  { id: '1', name: 'João Silva',    email: 'joao.silva@email.com',    role: 'organizer',   status: 'active',    eventsCount: 12, totalRevenue: 45600, lastLogin: '2025-01-27T10:30:00Z' },
  { id: '2', name: 'Maria Santos',  email: 'maria.santos@email.com',  role: 'participant', status: 'active',    eventsCount: 0,  totalRevenue: 0,     lastLogin: '2025-01-26T15:45:00Z' },
  { id: '3', name: 'Pedro Costa',   email: 'pedro.costa@email.com',   role: 'organizer',   status: 'suspended', eventsCount: 8,  totalRevenue: 23400, lastLogin: '2025-01-20T09:15:00Z' },
];

const mockEvents = [
  { id: '1', title: 'Festival de Música Eletrônica 2025', organizer: 'Eventos SP',      date: '2025-03-15', status: 'active',         ticketsSold: 915, totalTickets: 1200, revenue: 125400 },
  { id: '2', title: 'Workshop de Marketing Digital',      organizer: 'Digital Academy', date: '2025-02-20', status: 'pending_review', ticketsSold: 30,  totalTickets: 50,   revenue: 7500   },
  { id: '3', title: 'Conferência de Tecnologia',          organizer: 'Tech Events',     date: '2025-01-10', status: 'completed',      ticketsSold: 200, totalTickets: 200,  revenue: 40000  },
];

const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
const formatDateTime = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', organizer: 'Organizador', participant: 'Participante' };

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin')       return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><FaCrown className="w-3 h-3" />Admin</span>;
  if (role === 'organizer')   return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700"><FaShieldAlt className="w-3 h-3" />Organizador</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"><FaUsers className="w-3 h-3" />Participante</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    pending_review: 'bg-amber-100 text-amber-700',
    completed: 'bg-blue-100 text-blue-700',
  };
  const label: Record<string, string> = { active: 'Ativo', suspended: 'Suspenso', pending_review: 'Em análise', completed: 'Finalizado' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{label[status] ?? status}</span>;
}

const TABS = [
  { id: 'overview',  label: 'Visão Geral',  icon: FaChartLine },
  { id: 'users',     label: 'Usuários',     icon: FaUsers },
  { id: 'events',    label: 'Eventos',      icon: FaCalendarAlt },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <DashboardLayout userRole="admin">
      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>

        {/* Page Header */}
        <div className="mb-8">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            Painel Administrativo
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Gerencie toda a plataforma Ticketon</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total de Usuários',   value: mockStats.totalUsers.toLocaleString('pt-BR'),      delta: `+${mockStats.newUsersThisMonth} este mês`,   icon: FaUsers,       color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Eventos Ativos',      value: String(mockStats.activeEvents),                    delta: `+${mockStats.eventsThisMonth} este mês`,     icon: FaCalendarAlt, color: '#00C2A8', bg: '#f0fdfa' },
            { label: 'Receita Total',       value: formatBRL(mockStats.totalRevenue),                 delta: `+${formatBRL(mockStats.revenueThisMonth)}`,  icon: FaDollarSign,  color: '#10b981', bg: '#f0fdf4' },
            { label: 'Ingressos Vendidos',  value: mockStats.totalTicketsSold.toLocaleString('pt-BR'), delta: `Ticket médio: ${formatBRL(mockStats.averageTicketPrice)}`, icon: FaTicketAlt, color: '#f97316', bg: '#fff7ed' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>{stat.value}</p>
                  <p style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <FaArrowUp style={{ width: '10px' }} />{stat.delta}
                  </p>
                </div>
                <div style={{ width: '48px', height: '48px', background: stat.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <stat.icon style={{ color: stat.color, fontSize: '1.2rem' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', marginBottom: '1.5rem', width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                transition: 'all 0.15s',
                background: tab === t.id ? '#00C2A8' : 'transparent',
                color: tab === t.id ? 'white' : '#6b7280',
              }}
            >
              <t.icon style={{ fontSize: '0.8rem' }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Visão Geral */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Charts placeholder */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {['Crescimento de Usuários', 'Receita por Mês'].map((title) => (
                <div key={title} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>{title}</p>
                  <div style={{ height: '180px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e2e8f0' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Gráfico em breve</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Atividade Recente */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
              <p style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Atividade Recente</p>
              {[
                { action: 'Novo evento criado',  user: 'João Silva',  time: '2h atrás',  type: 'event' },
                { action: 'Usuário suspenso',    user: 'Pedro Costa', time: '4h atrás',  type: 'user'  },
                { action: 'Evento aprovado',     user: 'Maria Santos',time: '6h atrás',  type: 'event' },
                { action: 'Novo organizador',    user: 'Ana Lima',    time: '1 dia atrás',type: 'user' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.type === 'event' ? '#f0fdfa' : '#fff7ed', flexShrink: 0 }}>
                    {item.type === 'event'
                      ? <FaCalendarAlt style={{ color: '#00C2A8', fontSize: '0.85rem' }} />
                      : <FaUsers style={{ color: '#f97316', fontSize: '0.85rem' }} />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{item.action}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>por {item.user}</p>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Usuários */}
        {tab === 'users' && (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 700, color: '#111827' }}>Usuários</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }} />
                  <input placeholder="Buscar..." style={{ paddingLeft: '30px', paddingRight: '12px', height: '34px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', color: '#111827' }} />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', height: '34px', background: '#00C2A8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <FaPlus style={{ fontSize: '0.75rem' }} /> Adicionar
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', height: '34px', background: 'white', color: '#374151', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <FaDownload style={{ fontSize: '0.75rem' }} /> Exportar
                </button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Usuário', 'Papel', 'Status', 'Eventos', 'Receita', 'Último login', 'Ações'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#00C2A8', fontSize: '0.85rem', flexShrink: 0 }}>
                            {u.name.split(' ').slice(0,2).map(w => w[0]).join('')}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{u.name}</p>
                            <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}><RoleBadge role={u.role} /></td>
                      <td style={{ padding: '14px 20px' }}><StatusBadge status={u.status} /></td>
                      <td style={{ padding: '14px 20px', color: '#374151', fontSize: '0.875rem', fontWeight: 600 }}>{u.eventsCount}</td>
                      <td style={{ padding: '14px 20px', color: '#374151', fontSize: '0.875rem', fontWeight: 600 }}>{formatBRL(u.totalRevenue)}</td>
                      <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: '0.8rem' }}>{formatDateTime(u.lastLogin)}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><FaEye style={{ fontSize: '0.75rem' }} /></button>
                          <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><FaEdit style={{ fontSize: '0.75rem' }} /></button>
                          {u.status === 'active'
                            ? <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#fff1f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><FaBan style={{ fontSize: '0.75rem' }} /></button>
                            : <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><FaCheck style={{ fontSize: '0.75rem' }} /></button>
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Eventos */}
        {tab === 'events' && (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 700, color: '#111827' }}>Eventos</p>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', height: '34px', background: 'white', color: '#374151', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                <FaDownload style={{ fontSize: '0.75rem' }} /> Exportar
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Evento', 'Organizador', 'Data', 'Status', 'Ingressos', 'Receita', 'Ações'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockEvents.map((e) => (
                    <tr key={e.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem', maxWidth: '220px' }}>{e.title}</p>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#374151', fontSize: '0.875rem' }}>{e.organizer}</td>
                      <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: '0.85rem' }}>{formatDate(e.date)}</td>
                      <td style={{ padding: '14px 20px' }}><StatusBadge status={e.status} /></td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{e.ticketsSold}</p>
                        <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>de {e.totalTickets}</p>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>{formatBRL(e.revenue)}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><FaEye style={{ fontSize: '0.75rem' }} /></button>
                          <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><FaEdit style={{ fontSize: '0.75rem' }} /></button>
                          {e.status === 'pending_review'
                            ? <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><FaCheck style={{ fontSize: '0.75rem' }} /></button>
                            : <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#fff1f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><FaTimes style={{ fontSize: '0.75rem' }} /></button>
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
