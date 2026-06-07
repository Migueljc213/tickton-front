'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FaUsers, FaCalendarAlt, FaDollarSign, FaTicketAlt, FaChartLine,
  FaEye, FaEdit, FaPlus, FaDownload, FaSearch, FaCrown, FaShieldAlt,
  FaArrowUp, FaSpinner, FaTrash, FaGlobe, FaEyeSlash, FaTimes, FaCheck,
  FaUserTie, FaUser,
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const fmtBRL  = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDt   = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const MONTH_LABELS: Record<string, string> = {
  '01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun',
  '07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez',
};
const shortMonth = (ym: string) => { const [,m] = ym.split('-'); return MONTH_LABELS[m] ?? ym; };

/* ─── Gráfico de barras SVG ──────────────────────────────────────────────── */
function BarChart({ data, valueKey, color = '#00C2A8', formatValue }: {
  data: Array<Record<string, string | number>>;
  valueKey: string; color?: string; formatValue?: (v: number) => string;
}) {
  if (!data.length)
    return (
      <div style={{ height: 160, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, color:'#94a3b8' }}>
        <div style={{ fontSize:'2rem' }}>📊</div>
        <p style={{ fontSize:'0.8rem', margin:0, textAlign:'center', maxWidth:180 }}>
          Os dados aparecerão aqui conforme as transações forem realizadas.
        </p>
      </div>
    );
  const values = data.map(d => Number(d[valueKey]) || 0);
  const max    = Math.max(...values, 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:160 }}>
      {data.map((d, i) => {
        const val = values[i]; const pct = (val / max) * 100;
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }} title={formatValue ? formatValue(val) : String(val)}>
            <span style={{ fontSize:9, color:'#94a3b8', whiteSpace:'nowrap' }}>{formatValue ? formatValue(val) : val}</span>
            <div style={{ width:'100%', background:color, borderRadius:'4px 4px 0 0', height:`${Math.max(pct,2)}%`, opacity:0.85 }} />
            <span style={{ fontSize:9, color:'#94a3b8' }}>{shortMonth(String(d.month))}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Badges ─────────────────────────────────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    admin:       { bg:'#fef3c7', color:'#92400e', icon:<FaCrown style={{width:10}}/>,    label:'Admin'        },
    organizer:   { bg:'#f0fdfa', color:'#0f766e', icon:<FaShieldAlt style={{width:10}}/>, label:'Organizador'  },
    participant: { bg:'#f3f4f6', color:'#374151', icon:<FaUsers style={{width:10}}/>,    label:'Participante' },
  };
  const s = map[role] ?? map.participant;
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:700, background:s.bg, color:s.color }}>{s.icon}{s.label}</span>;
}

function StatusBadge({ published }: { published: boolean }) {
  return published
    ? <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:'#f0fdf4', color:'#15803d' }}>Publicado</span>
    : <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:'#f8fafc', color:'#475569' }}>Rascunho</span>;
}

/* ─── Modal de confirmação ───────────────────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'2rem', maxWidth:380, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
        <p style={{ fontWeight:700, color:'#111827', marginBottom:8, fontSize:'1rem' }}>Confirmar ação</p>
        <p style={{ color:'#6b7280', fontSize:'0.875rem', marginBottom:'1.5rem' }}>{message}</p>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color:'#374151', cursor:'pointer', fontWeight:600, fontSize:'0.875rem' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ padding:'8px 16px', borderRadius:8, border:'none', background:'#ef4444', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'0.875rem' }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal de detalhes do usuário ───────────────────────────────────────── */
function UserModal({ user, onClose, onDelete, onRoleChange }: {
  user: ApiUser; onClose: () => void;
  onDelete: (id: number) => void;
  onRoleChange: (id: number, role: string) => void;
}) {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (role === user.role) { onClose(); return; }
    setSaving(true);
    await onRoleChange(user.id, role);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'2rem', maxWidth:420, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'#f0fdfa', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#00C2A8', fontSize:'1.1rem' }}>
              {user.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight:700, color:'#111827', margin:0 }}>{user.name}</p>
              <p style={{ color:'#6b7280', fontSize:'0.8rem', margin:0 }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'none', cursor:'pointer', color:'#9ca3af', fontSize:'1.1rem', padding:4 }}><FaTimes /></button>
        </div>

        <div style={{ display:'grid', gap:'0.75rem', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f1f5f9', fontSize:'0.85rem' }}>
            <span style={{ color:'#6b7280' }}>ID</span><span style={{ fontWeight:600, color:'#111827' }}>#{user.id}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f1f5f9', fontSize:'0.85rem' }}>
            <span style={{ color:'#6b7280' }}>CPF/CNPJ</span><span style={{ fontWeight:600, color:'#111827' }}>{user.cpfCnpj ?? '—'}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f1f5f9', fontSize:'0.85rem' }}>
            <span style={{ color:'#6b7280' }}>Cadastrado em</span><span style={{ fontWeight:600, color:'#111827' }}>{fmtDate(user.createdAt)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', fontSize:'0.85rem' }}>
            <span style={{ color:'#6b7280' }}>Papel</span>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ padding:'4px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:'0.85rem', color:'#111827', background:'#fff' }}
            >
              <option value="participant">Participante</option>
              <option value="organizer">Organizador</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button
            onClick={() => onDelete(user.id)}
            style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #fee2e2', background:'#fff', color:'#ef4444', cursor:'pointer', fontWeight:600, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:6 }}
          >
            <FaTrash style={{ fontSize:'0.75rem' }} /> Excluir
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{ padding:'8px 14px', borderRadius:8, border:'none', background:'#00C2A8', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:6 }}
          >
            {saving ? <FaSpinner style={{ animation:'spin 1s linear infinite' }} /> : <FaCheck style={{ fontSize:'0.75rem' }} />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface PlatformStats {
  totalUsers: number; totalOrganizers: number; totalParticipants: number; newUsersThisMonth: number;
  totalEvents: number; publishedEvents: number; eventsThisMonth: number;
  totalRevenue: number; revenueThisMonth: number; totalTicketsSold: number; averageTicketPrice: number;
  monthlySales: Array<{ month: string; orders: number; revenue: number }>;
  monthlyUsers: Array<{ month: string; count: number }>;
}
interface ApiUser  { id: number; name: string; email: string; role: string; cpfCnpj?: string; createdAt: string; }
interface ApiEvent { id: number; title: string; organizerId: number; eventDate: string; isPublished: boolean; status: string; city: string | null; state: string | null; createdAt: string; }

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: FaChartLine },
  { id: 'users',    label: 'Usuários',    icon: FaUsers      },
  { id: 'events',   label: 'Eventos',     icon: FaCalendarAlt },
];

function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }
function authH(): HeadersInit { const t = getToken(); return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }; }

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const router  = useRouter();
  const [tab,   setTab]   = useState('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [events,setEvents]= useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch,  setUserSearch]  = useState('');
  const [eventSearch, setEventSearch] = useState('');

  /* Modais */
  const [selectedUser,  setSelectedUser]  = useState<ApiUser  | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const h = authH();
      const [sRes, uRes, eRes] = await Promise.all([
        fetch(`${API_URL}/analytics/platform`, { headers: h }),
        fetch(`${API_URL}/users`,              { headers: h }),
        fetch(`${API_URL}/events`,             { headers: h }),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (uRes.ok) { const d = await uRes.json(); setUsers(Array.isArray(d) ? d : (d.users ?? [])); }
      if (eRes.ok) { const d = await eRes.json(); setEvents(Array.isArray(d) ? d : (d.events ?? [])); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Ações de evento ────────────────────────────────────────────────────── */
  const togglePublish = (event: ApiEvent) => {
    const action = event.isPublished ? 'despublicar' : 'publicar';
    setConfirmAction({
      message: `Deseja ${action} o evento "${event.title}"?`,
      onConfirm: async () => {
        setConfirmAction(null);
        await fetch(`${API_URL}/events/${event.id}`, {
          method: 'PATCH', headers: authH(),
          body: JSON.stringify({ isPublished: !event.isPublished }),
        });
        setEvents(prev => prev.map(e => e.id === event.id ? { ...e, isPublished: !e.isPublished } : e));
      },
    });
  };

  const deleteEvent = (event: ApiEvent) => {
    setConfirmAction({
      message: `Tem certeza que deseja excluir o evento "${event.title}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        setConfirmAction(null);
        const res = await fetch(`${API_URL}/events/${event.id}`, { method: 'DELETE', headers: authH() });
        if (res.ok || res.status === 204) setEvents(prev => prev.filter(e => e.id !== event.id));
        else alert('Erro ao excluir o evento.');
      },
    });
  };

  /* ── Ações de usuário ───────────────────────────────────────────────────── */
  const deleteUser = (userId: number) => {
    setSelectedUser(null);
    setConfirmAction({
      message: 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        setConfirmAction(null);
        const res = await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE', headers: authH() });
        if (res.ok || res.status === 204) setUsers(prev => prev.filter(u => u.id !== userId));
        else alert('Erro ao excluir o usuário.');
      },
    });
  };

  const changeRole = async (userId: number, role: string) => {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH', headers: authH(),
      body: JSON.stringify({ role }),
    });
    if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    else alert('Erro ao alterar o papel do usuário.');
  };

  /* ── Atividade recente ─────────────────────────────────────────────────── */
  const recentActivity = [
    ...events.slice(0,5).map(e => ({ action: e.isPublished ? 'Evento publicado' : 'Evento criado', subject: e.title, time: e.createdAt, type: 'event' as const })),
    ...users.slice(0,5).map(u => ({ action: u.role === 'organizer' ? 'Novo organizador' : 'Novo usuário', subject: u.name, time: u.createdAt, type: 'user' as const })),
  ].sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0,6);

  const filteredUsers  = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(eventSearch.toLowerCase()));

  const statCards = [
    { label:'Total de Usuários',  value: stats ? stats.totalUsers.toLocaleString('pt-BR')       : null, delta: stats ? `+${stats.newUsersThisMonth} este mês`                    : null, icon:FaUsers,       color:'#3b82f6', bg:'#eff6ff' },
    { label:'Eventos Publicados', value: stats ? String(stats.publishedEvents)                   : null, delta: stats ? `+${stats.eventsThisMonth} este mês`                     : null, icon:FaCalendarAlt, color:'#00C2A8', bg:'#f0fdfa' },
    { label:'Receita Total',      value: stats ? fmtBRL(stats.totalRevenue)                      : null, delta: stats ? `+${fmtBRL(stats.revenueThisMonth)} este mês`            : null, icon:FaDollarSign,  color:'#10b981', bg:'#f0fdf4' },
    { label:'Ingressos Vendidos', value: stats ? stats.totalTicketsSold.toLocaleString('pt-BR')  : null, delta: stats ? `Ticket médio: ${fmtBRL(stats.averageTicketPrice)}`      : null, icon:FaTicketAlt,  color:'#f97316', bg:'#fff7ed' },
  ];

  const btnStyle = (color: string, bg = '#f8fafc'): React.CSSProperties => ({
    width:30, height:30, borderRadius:6, border:'none', background:bg,
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color,
    transition:'opacity 0.15s',
  });

  return (
    <DashboardLayout userRole="admin">
      <div style={{ background:'#f8fafc', minHeight:'100vh', padding:'2rem' }}>

        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontSize:'1.75rem', fontWeight:800, color:'#111827', marginBottom:4 }}>Painel Administrativo</h1>
          <p style={{ color:'#6b7280', fontSize:'0.9rem' }}>Gerencie toda a plataforma Ticketon</p>
        </div>

        <>
          {/* Stats — sempre visíveis; skeleton individual enquanto carrega */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1rem', marginBottom:'2rem' }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background:'white', borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'0.78rem', fontWeight:600, color:'#6b7280', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</p>
                    {s.value === null ? (
                      <>
                        <div style={{ height:32, width:120, background:'#f1f5f9', borderRadius:8, marginBottom:8, animation:'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ height:14, width:140, background:'#f1f5f9', borderRadius:6, animation:'pulse 1.5s ease-in-out infinite' }} />
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize:'1.6rem', fontWeight:800, color:'#111827', lineHeight:1.1 }}>{s.value}</p>
                        <p style={{ fontSize:'0.78rem', color:'#10b981', fontWeight:600, marginTop:6, display:'flex', alignItems:'center', gap:3 }}><FaArrowUp style={{width:10}}/>{s.delta}</p>
                      </>
                    )}
                  </div>
                  <div style={{ width:48, height:48, background:s.bg, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <s.icon style={{ color:s.color, fontSize:'1.2rem' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:4, background:'white', padding:4, borderRadius:12, marginBottom:'1.5rem', width:'fit-content', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, transition:'all 0.15s', background: tab===t.id ? '#00C2A8' : 'transparent', color: tab===t.id ? 'white' : '#6b7280' }}>
                <t.icon style={{ fontSize:'0.8rem' }} />{t.label}
              </button>
            ))}
          </div>

          {/* ── Visão Geral ─────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div style={{ display:'grid', gap:'1.5rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div style={{ background:'white', borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9' }}>
                  <p style={{ fontWeight:700, color:'#111827', marginBottom:'1rem' }}>Crescimento de Usuários</p>
                  <BarChart data={stats?.monthlyUsers ?? []} valueKey="count" color="#3b82f6" />
                </div>
                <div style={{ background:'white', borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9' }}>
                  <p style={{ fontWeight:700, color:'#111827', marginBottom:'1rem' }}>Receita por Mês</p>
                  <BarChart data={stats?.monthlySales ?? []} valueKey="revenue" color="#00C2A8" formatValue={fmtBRL} />
                </div>
              </div>

              <div style={{ background:'white', borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9' }}>
                <p style={{ fontWeight:700, color:'#111827', marginBottom:'1rem' }}>Atividade Recente</p>
                {recentActivity.length === 0
                  ? <p style={{ color:'#94a3b8', fontSize:'0.85rem' }}>Nenhuma atividade ainda.</p>
                  : recentActivity.map((item, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i < recentActivity.length-1 ? '1px solid #f1f5f9':'none' }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: item.type==='event' ? '#f0fdfa':'#fff7ed', flexShrink:0 }}>
                        {item.type==='event' ? <FaCalendarAlt style={{ color:'#00C2A8', fontSize:'0.85rem' }}/> : <FaUsers style={{ color:'#f97316', fontSize:'0.85rem' }}/>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:600, color:'#111827', fontSize:'0.875rem', margin:0 }}>{item.action}</p>
                        <p style={{ color:'#6b7280', fontSize:'0.78rem', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.subject}</p>
                      </div>
                      <p style={{ color:'#94a3b8', fontSize:'0.78rem', flexShrink:0 }}>{fmtDt(item.time)}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ── Usuários ────────────────────────────────────────────────── */}
          {tab === 'users' && (
            <div style={{ background:'white', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9', overflow:'hidden' }}>
              <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <p style={{ fontWeight:700, color:'#111827', fontSize:'1rem', margin:0 }}>
                  Usuários <span style={{ color:'#6b7280', fontWeight:400, fontSize:'0.85rem' }}>({filteredUsers.length})</span>
                </p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <div style={{ position:'relative' }}>
                    <FaSearch style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:'0.8rem', pointerEvents:'none' }}/>
                    <input placeholder="Buscar por nome ou email..." value={userSearch} onChange={e=>setUserSearch(e.target.value)}
                      style={{ paddingLeft:30, paddingRight:12, height:36, border:'1px solid #e2e8f0', borderRadius:8, fontSize:'0.85rem', outline:'none', color:'#111827', minWidth:220 }}/>
                  </div>
                  <button
                    onClick={() => router.push('/admin/users')}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'0 14px', height:36, background:'#00C2A8', color:'white', border:'none', borderRadius:8, fontSize:'0.85rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}
                  >
                    <FaPlus style={{ fontSize:'0.75rem' }}/> Adicionar usuário
                  </button>
                  <button
                    onClick={() => { const csv=['Nome,Email,Papel,Cadastrado',...filteredUsers.map(u=>`"${u.name}","${u.email}","${u.role}","${fmtDate(u.createdAt)}"`)].join('\n'); const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='usuarios.csv';a.click(); }}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'0 14px', height:36, background:'white', color:'#374151', border:'1px solid #e2e8f0', borderRadius:8, fontSize:'0.85rem', fontWeight:600, cursor:'pointer' }}
                  >
                    <FaDownload style={{ fontSize:'0.75rem' }}/> Exportar
                  </button>
                </div>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#f8fafc' }}>
                      {['Usuário', 'Papel', 'Cadastrado em', 'Ações'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'12px 20px', fontSize:'0.75rem', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0
                      ? <tr><td colSpan={4} style={{ padding:'2rem', textAlign:'center', color:'#94a3b8' }}>Nenhum usuário encontrado</td></tr>
                      : filteredUsers.map(u => (
                        <tr key={u.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                          <td style={{ padding:'14px 20px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:36, height:36, borderRadius:'50%', background:'#f0fdfa', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#00C2A8', fontSize:'0.85rem', flexShrink:0 }}>
                                {u.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <p style={{ fontWeight:600, color:'#111827', fontSize:'0.875rem', margin:0 }}>{u.name}</p>
                                <p style={{ color:'#6b7280', fontSize:'0.78rem', margin:0 }}>{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'14px 20px' }}><RoleBadge role={u.role} /></td>
                          <td style={{ padding:'14px 20px', color:'#6b7280', fontSize:'0.8rem' }}>{fmtDate(u.createdAt)}</td>
                          <td style={{ padding:'14px 20px' }}>
                            <div style={{ display:'flex', gap:4 }}>
                              <button
                                onClick={() => setSelectedUser(u)}
                                title="Ver / editar usuário"
                                style={btnStyle('#6b7280')}
                              >
                                <FaEye style={{ fontSize:'0.75rem' }}/>
                              </button>
                              <button
                                onClick={() => deleteUser(u.id)}
                                title="Excluir usuário"
                                style={btnStyle('#ef4444', '#fff1f2')}
                              >
                                <FaTrash style={{ fontSize:'0.75rem' }}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Eventos ─────────────────────────────────────────────────── */}
          {tab === 'events' && (
            <div style={{ background:'white', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9', overflow:'hidden' }}>
              <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <p style={{ fontWeight:700, color:'#111827', fontSize:'1rem', margin:0 }}>
                  Eventos <span style={{ color:'#6b7280', fontWeight:400, fontSize:'0.85rem' }}>({filteredEvents.length})</span>
                </p>
                <div style={{ display:'flex', gap:8 }}>
                  <div style={{ position:'relative' }}>
                    <FaSearch style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:'0.8rem', pointerEvents:'none' }}/>
                    <input placeholder="Buscar evento..." value={eventSearch} onChange={e=>setEventSearch(e.target.value)}
                      style={{ paddingLeft:30, paddingRight:12, height:36, border:'1px solid #e2e8f0', borderRadius:8, fontSize:'0.85rem', outline:'none', color:'#111827', minWidth:200 }}/>
                  </div>
                  <button
                    onClick={() => { const csv=['Título,Organizador,Data,Status,Local',...filteredEvents.map(e=>`"${e.title}","${e.organizerId}","${fmtDate(e.eventDate)}","${e.isPublished?'Publicado':'Rascunho'}","${e.city??''} ${e.state??''}"`)].join('\n'); const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='eventos.csv';a.click(); }}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'0 14px', height:36, background:'white', color:'#374151', border:'1px solid #e2e8f0', borderRadius:8, fontSize:'0.85rem', fontWeight:600, cursor:'pointer' }}
                  >
                    <FaDownload style={{ fontSize:'0.75rem' }}/> Exportar
                  </button>
                </div>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#f8fafc' }}>
                      {['Evento','Org. ID','Data','Status','Local','Ações'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'12px 20px', fontSize:'0.75rem', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.length === 0
                      ? <tr><td colSpan={6} style={{ padding:'2rem', textAlign:'center', color:'#94a3b8' }}>Nenhum evento encontrado</td></tr>
                      : filteredEvents.map(e => (
                        <tr key={e.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                          <td style={{ padding:'14px 20px' }}>
                            <p style={{ fontWeight:600, color:'#111827', fontSize:'0.875rem', maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{e.title}</p>
                          </td>
                          <td style={{ padding:'14px 20px', color:'#374151', fontSize:'0.875rem' }}>#{e.organizerId}</td>
                          <td style={{ padding:'14px 20px', color:'#6b7280', fontSize:'0.85rem', whiteSpace:'nowrap' }}>{fmtDate(e.eventDate)}</td>
                          <td style={{ padding:'14px 20px' }}><StatusBadge published={e.isPublished} /></td>
                          <td style={{ padding:'14px 20px', color:'#6b7280', fontSize:'0.8rem' }}>{e.city ? `${e.city}${e.state?`, ${e.state}`:''}` : '—'}</td>
                          <td style={{ padding:'14px 20px' }}>
                            <div style={{ display:'flex', gap:4 }}>
                              {/* Ver */}
                              <button
                                onClick={() => router.push(`/events/${e.id}`)}
                                title="Ver evento"
                                style={btnStyle('#6b7280')}
                              >
                                <FaEye style={{ fontSize:'0.75rem' }}/>
                              </button>
                              {/* Editar */}
                              <button
                                onClick={() => router.push(`/organizer/events/${e.id}/edit`)}
                                title="Editar evento"
                                style={btnStyle('#3b82f6', '#eff6ff')}
                              >
                                <FaEdit style={{ fontSize:'0.75rem' }}/>
                              </button>
                              {/* Publicar / Despublicar */}
                              <button
                                onClick={() => togglePublish(e)}
                                title={e.isPublished ? 'Despublicar' : 'Publicar'}
                                style={e.isPublished ? btnStyle('#d97706', '#fffbeb') : btnStyle('#15803d', '#f0fdf4')}
                              >
                                {e.isPublished
                                  ? <FaEyeSlash style={{ fontSize:'0.75rem' }}/>
                                  : <FaGlobe    style={{ fontSize:'0.75rem' }}/>
                                }
                              </button>
                              {/* Excluir */}
                              <button
                                onClick={() => deleteEvent(e)}
                                title="Excluir evento"
                                style={btnStyle('#ef4444', '#fff1f2')}
                              >
                                <FaTrash style={{ fontSize:'0.75rem' }}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      </div>

      {/* ── Modais ──────────────────────────────────────────────────────────── */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDelete={deleteUser}
          onRoleChange={changeRole}
        />
      )}
      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </DashboardLayout>
  );
}
