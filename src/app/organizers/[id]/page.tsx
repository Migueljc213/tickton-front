'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaGlobe,
  FaCheckDouble, FaTicketAlt, FaPlus, FaPoll, FaAlignLeft,
  FaTimes, FaCheckCircle,
} from 'react-icons/fa';
import { storage } from '@/lib/utils/storage';
import { formatDate } from '@/lib/utils/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Organizer {
  id: number; userId: number; companyName: string;
  description: string | null; logoUrl: string | null;
  city: string | null; state: string | null;
  website: string | null; isVerified: boolean;
}
interface OrgEvent {
  id: number; title: string; eventDate: string; category: string;
  city: string | null; state: string | null; bannerUrl: string | null; isPublished: boolean;
}
interface OrgPost  { id: number; organizerId: number; content: string; createdAt: string; }
interface OrgPoll  { id: number; organizerId: number; question: string; options: string[]; totalVotes: number; createdAt: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseCover(b?: string | null): string | null {
  if (!b) return null;
  try { const p = JSON.parse(b); if (Array.isArray(p) && p.length) return p[0]; } catch {}
  return b;
}
const CAT_GRAD: Record<string,string> = {
  music:'from-violet-500 to-purple-600', party:'from-pink-500 to-rose-600',
  course:'from-blue-500 to-sky-600', conference:'from-yellow-500 to-amber-600',
  workshop:'from-orange-500 to-amber-600', festival:'from-teal-500 to-cyan-600',
  other:'from-[#003B4A] to-[#00C2A8]',
};
const CAT_ICON: Record<string,string> = {
  music:'🎵', party:'🎉', course:'📚', conference:'🎤',
  workshop:'🔧', festival:'🎪', other:'🎊',
};
function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return `${Math.floor(s/60)}min atrás`;
  if (s < 86400) return `${Math.floor(s/3600)}h atrás`;
  const days = Math.floor(s/86400);
  if (days < 30) return `${days}d atrás`;
  return new Date(d).toLocaleDateString('pt-BR');
}

// ─── Poll Card ────────────────────────────────────────────────────────────────
function PollCard({ poll, canVote }: { poll: OrgPoll; canVote: boolean }) {
  const [votes, setVotes]   = useState<Record<number,number>>({});
  const [myVote, setMyVote] = useState<number|null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/organizer-content/polls/${poll.id}/results`)
      .then(r => r.ok ? r.json() : { votes: {} })
      .then(d => setVotes(d.votes ?? {}))
      .catch(() => {});
  }, [poll.id]);

  const totalVotes = Object.values(votes).reduce((a,b) => a+b, 0);

  const handleVote = async (idx: number) => {
    if (voting || myVote !== null || !canVote) return;
    const token = storage.getToken();
    if (!token) return;
    setVoting(true);
    try {
      const res = await fetch(`${API_URL}/organizer-content/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ optionIndex: idx }),
      });
      if (res.ok) { const d = await res.json(); setVotes(d.votes ?? {}); setMyVote(idx); }
    } finally { setVoting(false); }
  };

  const voted = myVote !== null;
  const maxPct = totalVotes > 0 ? Math.max(...poll.options.map((_,i) => Math.round(((votes[i]??0)/totalVotes)*100))) : 0;

  return (
    <div className="space-y-2">
      {poll.options.map((opt, i) => {
        const count = votes[i] ?? 0;
        const pct   = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const isWin = voted && pct === maxPct && count > 0;
        const isMy  = myVote === i;
        return (
          <button key={i} onClick={() => handleVote(i)}
            disabled={voted || !canVote || voting}
            className="relative w-full text-left overflow-hidden rounded-xl border-2 transition-all disabled:cursor-default"
            style={{ borderColor: isMy ? '#00C2A8' : '#e5e7eb' }}>
            {voted && (
              <div className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700"
                style={{ width:`${pct}%`, background: isMy ? 'rgba(0,194,168,0.12)' : isWin ? 'rgba(0,59,74,0.06)' : 'rgba(0,0,0,0.03)' }} />
            )}
            <div className="relative flex items-center justify-between px-4 py-3">
              <span className={`text-sm font-medium ${isMy ? 'text-[#00C2A8]' : 'text-gray-700'}`}>
                {isMy && <FaCheckCircle className="inline mr-1.5 text-xs" />}
                {opt}
              </span>
              {voted && <span className={`text-xs font-bold ml-2 flex-shrink-0 ${isMy ? 'text-[#00C2A8]' : 'text-gray-400'}`}>{pct}%</span>}
            </div>
          </button>
        );
      })}
      <p className="text-xs text-gray-400 text-right">
        {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
        {!canVote && ' · Faça login para votar'}
      </p>
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateModal({ organizerId, onClose, onCreated }: {
  organizerId: number; onClose: () => void; onCreated: () => void;
}) {
  const [tab, setTab]         = useState<'post'|'poll'>('post');
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions]   = useState(['','']);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string|null>(null);

  const submit = async () => {
    const token = storage.getToken();
    setSaving(true); setError(null);
    try {
      if (tab === 'post') {
        if (!content.trim()) { setError('Escreva algo!'); return; }
        const r = await fetch(`${API_URL}/organizer-content/${organizerId}/post`, {
          method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
          body: JSON.stringify({ content }),
        });
        if (!r.ok) throw new Error('Erro ao publicar');
      } else {
        if (!question.trim()) { setError('Escreva a pergunta!'); return; }
        const valid = options.filter(o => o.trim());
        if (valid.length < 2) { setError('Adicione pelo menos 2 opções'); return; }
        const r = await fetch(`${API_URL}/organizer-content/${organizerId}/poll`, {
          method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
          body: JSON.stringify({ question, options: valid }),
        });
        if (!r.ok) throw new Error('Erro ao criar enquete');
      }
      onCreated(); onClose();
    } catch(e) { setError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Nova publicação</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        <div className="flex border-b border-gray-100">
          {(['post','poll'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                tab===t ? 'text-[#00C2A8] border-b-2 border-[#00C2A8]' : 'text-gray-400 hover:text-gray-700'
              }`}>
              {t==='post' ? <><FaAlignLeft/> Texto</> : <><FaPoll/> Enquete</>}
            </button>
          ))}
        </div>
        <div className="p-5 space-y-4">
          {tab === 'post' ? (
            <textarea className="input-form resize-none" rows={5} autoFocus maxLength={2000}
              placeholder="Compartilhe uma novidade com seus seguidores..."
              value={content} onChange={e => setContent(e.target.value)} />
          ) : (
            <div className="space-y-3">
              <input className="input-form" autoFocus maxLength={500}
                placeholder="Qual é a sua pergunta?" value={question}
                onChange={e => setQuestion(e.target.value)} />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opções</p>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input-form flex-1" placeholder={`Opção ${i+1}`}
                    value={opt} maxLength={200}
                    onChange={e => { const o=[...options]; o[i]=e.target.value; setOptions(o); }} />
                  {options.length > 2 && (
                    <button onClick={() => setOptions(options.filter((_,j)=>j!==i))}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-200 transition-colors flex-shrink-0">
                      <FaTimes/>
                    </button>
                  )}
                </div>
              ))}
              {options.length < 5 && (
                <button onClick={() => setOptions([...options,''])}
                  className="text-sm text-[#00C2A8] font-semibold flex items-center gap-1.5 hover:underline">
                  <FaPlus className="text-xs"/> Adicionar opção
                </button>
              )}
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={submit} disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-50 transition-all"
            style={{ background:'linear-gradient(135deg,#003B4A,#00C2A8)' }}>
            {saving ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Small Event Card ─────────────────────────────────────────────────────────
function OrgEventCard({ ev, dim }: { ev: OrgEvent; dim?: boolean }) {
  const cover = parseCover(ev.bannerUrl);
  const grad  = CAT_GRAD[ev.category] ?? CAT_GRAD.other;
  const icon  = CAT_ICON[ev.category] ?? '🎊';
  return (
    <Link href={`/events/${ev.id}`}
      className={`group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all ${dim ? 'opacity-55 hover:opacity-100' : 'hover:-translate-y-0.5'}`}>
      <div className="relative h-36 overflow-hidden">
        {cover
          ? <img src={cover} alt={ev.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
          : <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center text-4xl`}>{icon}</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
        {dim && <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Encerrado</div>}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#00C2A8] transition-colors">{ev.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
          <FaCalendarAlt className="text-[#00C2A8] text-[10px]"/> {formatDate(ev.eventDate)}
        </div>
        {(ev.city||ev.state) && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
            <FaMapMarkerAlt className="text-[#00C2A8] text-[10px]"/>
            {[ev.city,ev.state].filter(Boolean).join(' - ')}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Tab = 'feed' | 'upcoming' | 'past';

export default function OrganizerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const organizerId = Number(params.id);

  const [organizer, setOrganizer] = useState<Organizer|null>(null);
  const [events, setEvents]       = useState<OrgEvent[]>([]);
  const [posts, setPosts]         = useState<OrgPost[]>([]);
  const [polls, setPolls]         = useState<OrgPoll[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>('feed');
  const [showModal, setShowModal] = useState(false);

  const userId   = storage.getUserId();
  const hasToken = !!storage.getToken();

  const load = useCallback(async () => {
    if (!organizerId) return;
    setLoading(true);
    try {
      const [orgRes, evRes, postRes, pollRes] = await Promise.all([
        fetch(`${API_URL}/organizers/${organizerId}`),
        fetch(`${API_URL}/events/organizer/${organizerId}`),
        fetch(`${API_URL}/organizer-content/${organizerId}/posts`),
        fetch(`${API_URL}/organizer-content/${organizerId}/polls`),
      ]);
      if (orgRes.ok)  setOrganizer(await orgRes.json());
      if (evRes.ok)   { const d = await evRes.json(); setEvents(d.events ?? []); }
      if (postRes.ok) setPosts(await postRes.json());
      if (pollRes.ok) setPolls(await pollRes.json());
    } finally { setLoading(false); }
  }, [organizerId]);

  useEffect(() => { load(); }, [load]);

  const isOwner = organizer?.userId === userId;

  const now          = new Date();
  const upcoming     = events.filter(e => new Date(e.eventDate) >= now)
                             .sort((a,b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const pastEvents   = events.filter(e => new Date(e.eventDate) < now)
                             .sort((a,b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  type FeedItem = { kind:'post'; data:OrgPost } | { kind:'poll'; data:OrgPoll };
  const feed: FeedItem[] = [
    ...posts.map(p => ({ kind:'post' as const, data:p })),
    ...polls.map(p => ({ kind:'poll' as const, data:p })),
  ].sort((a,b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-48 bg-gray-200 animate-pulse"/>
        <div className="container mx-auto px-4 max-w-4xl -mt-12">
          <div className="w-24 h-24 rounded-2xl bg-gray-300 animate-pulse mb-4"/>
          <div className="bg-white rounded-2xl p-6 animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"/>
            <div className="h-4 bg-gray-200 rounded w-1/2"/>
          </div>
        </div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-2xl shadow-sm max-w-sm mx-4">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Organizador não encontrado</h2>
          <button onClick={() => router.push('/events')}
            className="mt-4 px-6 py-3 rounded-xl text-white font-bold"
            style={{ background:'#00C2A8' }}>
            Ver eventos
          </button>
        </div>
      </div>
    );
  }

  const initial = organizer.companyName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Cover banner ─────────────────────────────────────────────────────── */}
      <div className="h-48 md:h-56 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#003B4A 0%,#007465 60%,#00C2A8 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:'radial-gradient(circle at 20% 50%,white 1px,transparent 1px),radial-gradient(circle at 80% 20%,white 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>
        <button onClick={() => router.back()}
          className="absolute top-5 left-5 flex items-center gap-2 text-white/80 hover:text-white text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl transition-all">
          <FaArrowLeft className="text-xs"/> Voltar
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">

        {/* ── Avatar + Info ─────────────────────────────────────────────────── */}
        <div className="relative -mt-14 mb-6 flex items-end gap-5">
          {organizer.logoUrl ? (
            <img src={organizer.logoUrl} alt={organizer.companyName}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0"/>
          ) : (
            <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-black flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#003B4A,#00C2A8)' }}>
              {initial}
            </div>
          )}
        </div>

        {/* ── Card de perfil ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-gray-900">{organizer.companyName}</h1>
                {organizer.isVerified && (
                  <span className="flex items-center gap-1 text-[#00C2A8] text-xs font-bold bg-[#00C2A8]/10 px-2.5 py-1 rounded-full">
                    <FaCheckDouble className="text-[10px]"/> Verificado
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                {(organizer.city||organizer.state) && (
                  <span className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-[#00C2A8] text-xs"/>
                    {[organizer.city,organizer.state].filter(Boolean).join(' - ')}
                  </span>
                )}
                {organizer.website && (
                  <a href={organizer.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#00C2A8] hover:underline">
                    <FaGlobe className="text-xs"/> Site oficial
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <FaTicketAlt className="text-[#00C2A8] text-xs"/>
                  {events.length} evento{events.length!==1?'s':''}
                </span>
              </div>
              {organizer.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{organizer.description}</p>
              )}
            </div>
            {isOwner && (
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all flex-shrink-0"
                style={{ background:'#00C2A8' }}>
                <FaPlus/> Nova publicação
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6">
          {([
            { key:'feed',     label:'Posts & Enquetes', icon:<FaAlignLeft/> },
            { key:'upcoming', label:`Próximos (${upcoming.length})`, icon:<FaCalendarAlt/> },
            { key:'past',     label:`Passados (${pastEvents.length})`, icon:<FaCalendarAlt/> },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                tab===t.key ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              style={tab===t.key ? { background:'linear-gradient(135deg,#003B4A,#00C2A8)' } : {}}>
              {t.icon} <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Feed ──────────────────────────────────────────────────────────── */}
        {tab === 'feed' && (
          <div className="space-y-4 pb-10">
            {feed.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-14 text-center">
                <FaAlignLeft className="text-5xl text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-400 font-medium text-lg">Nenhuma publicação ainda</p>
                {isOwner && (
                  <button onClick={() => setShowModal(true)}
                    className="mt-5 px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90"
                    style={{ background:'#00C2A8' }}>
                    Criar primeira publicação
                  </button>
                )}
                {!isOwner && (
                  <p className="text-gray-400 text-sm mt-2">
                    Este organizador ainda não publicou nada.
                  </p>
                )}
              </div>
            )}
            {feed.map(item => (
              <div key={`${item.kind}-${item.data.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {/* Post header */}
                <div className="flex items-center gap-3 mb-4">
                  {organizer.logoUrl
                    ? <img src={organizer.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>
                    : <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background:'linear-gradient(135deg,#003B4A,#00C2A8)' }}>{initial}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">{organizer.companyName}</p>
                      {item.kind === 'poll' && (
                        <span className="text-xs bg-purple-100 text-purple-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaPoll className="text-[10px]"/> Enquete
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{timeAgo(item.data.createdAt)}</p>
                  </div>
                </div>
                {/* Content */}
                {item.kind === 'post' && (
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{item.data.content}</p>
                )}
                {item.kind === 'poll' && (
                  <>
                    <p className="font-bold text-gray-900 mb-4">{item.data.question}</p>
                    <PollCard poll={item.data} canVote={hasToken}/>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Próximos Eventos ──────────────────────────────────────────────── */}
        {tab === 'upcoming' && (
          <div className="pb-10">
            {upcoming.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-14 text-center">
                <FaCalendarAlt className="text-5xl text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-400 font-medium">Nenhum evento próximo</p>
                <Link href="/events" className="inline-block mt-4 text-sm font-semibold text-[#00C2A8] hover:underline">
                  Explorar outros eventos →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcoming.map(ev => <OrgEventCard key={ev.id} ev={ev}/>)}
              </div>
            )}
          </div>
        )}

        {/* ── Eventos Passados ──────────────────────────────────────────────── */}
        {tab === 'past' && (
          <div className="pb-10">
            {pastEvents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-14 text-center">
                <FaCalendarAlt className="text-5xl text-gray-200 mx-auto mb-3"/>
                <p className="text-gray-400 font-medium">Nenhum evento anterior</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pastEvents.map(ev => <OrgEventCard key={ev.id} ev={ev} dim/>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {showModal && (
        <CreateModal organizerId={organizerId} onClose={() => setShowModal(false)} onCreated={load}/>
      )}
    </div>
  );
}
