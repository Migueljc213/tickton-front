'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRef } from 'react';
import {
  FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaGlobe,
  FaCheckDouble, FaTicketAlt, FaPlus, FaPoll, FaAlignLeft,
  FaTimes, FaCheckCircle, FaShoppingBag, FaEdit,
  FaTrash, FaShoppingCart, FaClipboardList, FaImage, FaLink,
  FaCamera, FaSpinner,
} from 'react-icons/fa';
import { storage } from '@/lib/utils/storage';
import { formatDate } from '@/lib/utils/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Organizer {
  id: number; userId: number; companyName: string;
  description: string | null; logoUrl: string | null; coverUrl: string | null;
  city: string | null; state: string | null;
  website: string | null; isVerified: boolean;
}
interface OrgEvent {
  id: number; title: string; eventDate: string; category: string;
  city: string | null; state: string | null; bannerUrl: string | null; isPublished: boolean;
}
interface OrgPost  { id: number; organizerId: number; content: string; imageUrl?: string | null; linkUrl?: string | null; linkTitle?: string | null; createdAt: string; }
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
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl]   = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [showImageField, setShowImageField] = useState(false);
  const [showLinkField, setShowLinkField]   = useState(false);
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
        const body: Record<string, string> = { content };
        if (imageUrl.trim()) body.imageUrl = imageUrl.trim();
        if (linkUrl.trim()) body.linkUrl = linkUrl.trim();
        if (linkTitle.trim()) body.linkTitle = linkTitle.trim();
        const r = await fetch(`${API_URL}/organizer-content/${organizerId}/post`, {
          method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
          body: JSON.stringify(body),
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
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
              {t==='post' ? <><FaAlignLeft/> Publicação</> : <><FaPoll/> Enquete</>}
            </button>
          ))}
        </div>
        <div className="p-5 space-y-4">
          {tab === 'post' ? (
            <>
              <textarea className="input-form resize-none" rows={4} autoFocus maxLength={2000}
                placeholder="Compartilhe uma novidade com seus seguidores..."
                value={content} onChange={e => setContent(e.target.value)} />

              {showImageField && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">URL da imagem</label>
                  <input className="input-form" placeholder="https://exemplo.com/imagem.jpg"
                    value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                  {imageUrl && (
                    <img src={imageUrl} alt="preview" className="w-full rounded-xl object-cover max-h-48 border border-gray-100"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                </div>
              )}

              {showLinkField && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Link</label>
                  <input className="input-form" type="url" placeholder="https://..."
                    value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                  <input className="input-form" placeholder="Título do link (opcional)"
                    value={linkTitle} onChange={e => setLinkTitle(e.target.value)} maxLength={255} />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowImageField(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    showImageField ? 'bg-[#00C2A8]/10 text-[#00C2A8]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  <FaImage /> Imagem
                </button>
                <button type="button" onClick={() => setShowLinkField(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    showLinkField ? 'bg-[#00C2A8]/10 text-[#00C2A8]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  <FaLink /> Link
                </button>
              </div>
            </>
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

// ─── Cover upload button (owner only) ────────────────────────────────────────
function CoverUploadButton({ organizerId, onUploaded }: {
  organizerId: number; onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    const token = storage.getToken();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/organizers/${organizerId}/cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Erro ao enviar capa');
      const { coverUrl } = await res.json();
      onUploaded(coverUrl);
    } catch { /* silently ignore */ }
    finally { setUploading(false); }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all disabled:opacity-50"
      >
        {uploading ? <FaSpinner className="animate-spin text-xs" /> : <FaCamera className="text-xs" />}
        {uploading ? 'Enviando...' : 'Alterar capa'}
      </button>
    </>
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

// ─── Store Types ──────────────────────────────────────────────────────────────
interface StoreProduct {
  id: number; organizerId: number; name: string; description: string | null;
  price: number; stock: number; imageUrl: string | null; category: string;
  isActive: boolean; createdAt: string; eventId: number | null; eventName: string | null;
}
interface StoreOrder {
  id: number; productId: number; productName: string; customerName: string;
  customerEmail: string; customerPhone: string | null; quantity: number;
  unitPrice: number; totalAmount: number; status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null; createdAt: string;
}

// ─── Product Card (visitor) ───────────────────────────────────────────────────
function ProductCard({ product, onBuy }: { product: StoreProduct; onBuy: (p: StoreProduct) => void }) {
  const outOfStock = product.stock === 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-[#003B4A] to-[#00C2A8] flex items-center justify-center text-5xl">
          <FaShoppingBag className="text-white opacity-60" />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-[#00C2A8] uppercase tracking-wider mb-1">{product.category}</span>
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 flex-1 mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div>
            <p className="text-lg font-black text-[#003B4A]">
              R$ {Number(product.price).toFixed(2).replace('.', ',')}
            </p>
            <p className={`text-[11px] font-semibold ${outOfStock ? 'text-red-400' : 'text-gray-400'}`}>
              {outOfStock ? 'Esgotado' : `${product.stock} em estoque`}
            </p>
          </div>
          <button
            onClick={() => !outOfStock && onBuy(product)}
            disabled={outOfStock}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: outOfStock ? '#9ca3af' : 'linear-gradient(135deg,#003B4A,#00C2A8)' }}
          >
            <FaShoppingCart className="text-xs" /> Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Buy Modal ────────────────────────────────────────────────────────────────
function BuyModal({ product, onClose, onSuccess }: {
  product: StoreProduct; onClose: () => void; onSuccess: () => void;
}) {
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [phone, setPhone]   = useState('');
  const [qty, setQty]       = useState(1);
  const [notes, setNotes]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [done, setDone]     = useState(false);

  const total = (Number(product.price) * qty).toFixed(2).replace('.', ',');

  const submit = async () => {
    if (!name.trim() || !email.trim()) { setError('Nome e e-mail são obrigatórios'); return; }
    const token = storage.getToken();
    if (!token) { setError('Faça login para comprar'); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/organizer-store/products/${product.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerName: name, customerEmail: email, customerPhone: phone || undefined, quantity: qty, notes: notes || undefined }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Erro ao realizar pedido'); }
      setDone(true);
      onSuccess();
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Finalizar pedido</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">Pedido realizado!</h4>
            <p className="text-gray-500 text-sm mb-5">O organizador entrará em contato pelo e-mail informado.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: '#00C2A8' }}>Fechar</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 flex gap-3 items-start">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                : <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#003B4A] to-[#00C2A8] flex items-center justify-center flex-shrink-0"><FaShoppingBag className="text-white" /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm line-clamp-2">{product.name}</p>
                <p className="text-[#00C2A8] font-black text-base">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                <p className="text-xs text-gray-400">{product.stock} em estoque</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Quantidade</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors font-bold">−</button>
                <span className="w-10 text-center font-bold text-gray-900">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors font-bold">+</button>
                <span className="text-sm text-gray-500 ml-1">Total: <span className="font-bold text-gray-900">R$ {total}</span></span>
              </div>
            </div>

            <input className="input-form" placeholder="Seu nome *" value={name} onChange={e => setName(e.target.value)} />
            <input className="input-form" type="email" placeholder="Seu e-mail *" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input-form" placeholder="Telefone (opcional)" value={phone} onChange={e => setPhone(e.target.value)} />
            <textarea className="input-form resize-none" rows={2} placeholder="Observações (tamanho, cor...)" value={notes} onChange={e => setNotes(e.target.value)} />

            {error && <p className="text-sm text-red-500">{error}</p>}
            <button onClick={submit} disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}>
              {saving ? 'Enviando...' : `Confirmar pedido · R$ ${total}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Form Modal (owner) ───────────────────────────────────────────────
function ProductFormModal({ organizerId, product, events, onClose, onSaved }: {
  organizerId: number; product: StoreProduct | null; events: OrgEvent[];
  onClose: () => void; onSaved: () => void;
}) {
  const editing = product !== null;
  const [name, setName]       = useState(product?.name ?? '');
  const [desc, setDesc]       = useState(product?.description ?? '');
  const [price, setPrice]     = useState(product ? String(product.price) : '');
  const [stock, setStock]     = useState(product ? String(product.stock) : '');
  const [imgUrl, setImgUrl]   = useState(product?.imageUrl ?? '');
  const [cat, setCat]         = useState(product?.category ?? 'other');
  const [eventId, setEventId] = useState<string>(product?.eventId ? String(product.eventId) : '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const CATEGORIES = ['other','clothing','accessories','food','drinks','collectibles','digital'];

  const submit = async () => {
    if (!name.trim() || !price || !stock) { setError('Nome, preço e estoque são obrigatórios'); return; }
    const token = storage.getToken();
    setSaving(true); setError(null);
    try {
      const body = {
        name: name.trim(),
        description: desc.trim() || undefined,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: imgUrl.trim() || undefined,
        category: cat,
        eventId: eventId ? parseInt(eventId) : null,
      };
      const url = editing
        ? `${API_URL}/organizer-store/${organizerId}/products/${product!.id}`
        : `${API_URL}/organizer-store/${organizerId}/products`;
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Erro ao salvar'); }
      onSaved(); onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-gray-900 text-lg">{editing ? 'Editar produto' : 'Novo produto'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><FaTimes className="text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <input className="input-form" placeholder="Nome do produto *" value={name} onChange={e => setName(e.target.value)} />
          <textarea className="input-form resize-none" rows={2} placeholder="Descrição (opcional)" value={desc} onChange={e => setDesc(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Preço (R$) *</label>
              <input className="input-form" type="number" min="0" step="0.01" placeholder="0,00" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Estoque *</label>
              <input className="input-form" type="number" min="0" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Categoria</label>
              <select className="input-form" value={cat} onChange={e => setCat(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Evento relacionado</label>
              <select className="input-form" value={eventId} onChange={e => setEventId(e.target.value)}>
                <option value="">Sem evento específico</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
          </div>
          <input className="input-form" placeholder="URL da imagem (opcional)" value={imgUrl} onChange={e => setImgUrl(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={submit} disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}>
            {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Store Aside ──────────────────────────────────────────────────────────────
function StoreAside({ organizerId, isOwner, hasToken, events }: {
  organizerId: number; isOwner: boolean; hasToken: boolean; events: OrgEvent[];
}) {
  const [products, setProducts]     = useState<StoreProduct[]>([]);
  const [orders, setOrders]         = useState<StoreOrder[]>([]);
  const [loading, setLoading]       = useState(true);
  const [buyTarget, setBuyTarget]   = useState<StoreProduct | null>(null);
  const [editTarget, setEditTarget] = useState<StoreProduct | null | 'new'>(null);
  const [showOrders, setShowOrders] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isOwner
        ? `${API_URL}/organizer-store/${organizerId}/products/manage`
        : `${API_URL}/organizer-store/${organizerId}/products`;
      const headers: Record<string, string> = {};
      if (isOwner) { const t = storage.getToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
      const res = await fetch(endpoint, { headers });
      if (res.ok) setProducts(await res.json());
    } finally { setLoading(false); }
  }, [organizerId, isOwner]);

  const loadOrders = useCallback(async () => {
    const token = storage.getToken();
    if (!token) return;
    const res = await fetch(`${API_URL}/organizer-store/${organizerId}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setOrders(await res.json());
  }, [organizerId]);

  useEffect(() => {
    loadProducts();
    if (isOwner) loadOrders();
  }, [loadProducts, loadOrders, isOwner]);

  const deleteProduct = async (p: StoreProduct) => {
    if (!confirm(`Remover "${p.name}"?`)) return;
    const token = storage.getToken();
    await fetch(`${API_URL}/organizer-store/${organizerId}/products/${p.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    loadProducts();
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    const token = storage.getToken();
    await fetch(`${API_URL}/organizer-store/${organizerId}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-500',
  };
  const STATUS_LABELS: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmado', cancelled: 'Cancelado' };

  const activeProducts = products.filter(p => p.isActive);

  return (
    <aside className="lg:sticky lg:top-20 space-y-3 pb-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}
        >
          <div className="flex items-center gap-2 text-white">
            <FaShoppingBag className="text-sm" />
            <span className="font-bold text-sm">Loja do Organizador</span>
          </div>
          {activeProducts.length > 0 && (
            <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {activeProducts.length} {activeProducts.length === 1 ? 'item' : 'itens'}
            </span>
          )}
        </div>

        {isOwner && (
          <div className="px-3 py-2 border-b border-gray-50 flex gap-2">
            <button
              onClick={() => setEditTarget('new')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition-all"
              style={{ background: '#00C2A8' }}
            >
              <FaPlus className="text-[10px]" /> Novo produto
            </button>
            <button
              onClick={() => setShowOrders(!showOrders)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${showOrders ? 'bg-[#003B4A] text-white border-[#003B4A]' : 'text-gray-600 border-gray-200 hover:border-[#003B4A] hover:text-[#003B4A]'}`}
            >
              <FaClipboardList className="text-[10px]" />
              Pedidos {orders.length > 0 && <span className={`rounded-full text-[10px] px-1.5 py-0.5 ${showOrders ? 'bg-white/20 text-white' : 'bg-[#003B4A] text-white'}`}>{orders.length}</span>}
            </button>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="flex gap-3 p-3">
                <div className="skeleton w-16 h-16 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
              </div>
            ))
          ) : activeProducts.length === 0 ? (
            <div className="py-10 text-center px-4">
              <FaShoppingBag className="text-3xl text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm font-medium">Loja vazia</p>
              {isOwner && (
                <button onClick={() => setEditTarget('new')}
                  className="mt-3 text-[#00C2A8] text-xs font-semibold hover:underline">
                  + Adicionar primeiro produto
                </button>
              )}
            </div>
          ) : (
            activeProducts.map(p => {
              const outOfStock = p.stock === 0;
              return (
                <div key={p.id} className="flex gap-3 p-3 hover:bg-gray-50/60 transition-colors group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#003B4A] to-[#00C2A8] flex items-center justify-center">
                        <FaShoppingBag className="text-white text-lg" />
                      </div>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">ESGOTADO</span>
                      </div>
                    )}
                    {isOwner && !p.isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">INATIVO</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{p.name}</p>
                    {p.eventName && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#00C2A8] font-semibold bg-[#00C2A8]/8 px-1.5 py-0.5 rounded-md mt-0.5 max-w-full">
                        <FaTicketAlt className="text-[8px] flex-shrink-0" />
                        <span className="truncate">{p.eventName}</span>
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-1.5 gap-1">
                      <div>
                        <p className="text-base font-black text-[#003B4A]">
                          R$ {Number(p.price).toFixed(2).replace('.', ',')}
                        </p>
                        <p className={`text-[11px] font-semibold ${outOfStock ? 'text-red-400' : p.stock <= 5 ? 'text-amber-500' : 'text-gray-400'}`}>
                          {outOfStock ? 'Esgotado' : `${p.stock} em estoque`}
                        </p>
                      </div>
                      {!outOfStock && (
                        <button
                          onClick={() => setBuyTarget(p)}
                          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-bold hover:opacity-90 transition-all"
                          style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}
                        >
                          <FaShoppingCart className="text-[10px]" /> Comprar
                        </button>
                      )}
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => setEditTarget(p)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#00C2A8] hover:bg-[#00C2A8]/10 transition-colors">
                        <FaEdit className="text-[10px]" />
                      </button>
                      <button onClick={() => deleteProduct(p)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <FaTrash className="text-[10px]" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {isOwner && showOrders && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FaClipboardList className="text-[#00C2A8]" /> Pedidos recentes
            </h3>
          </div>
          {orders.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Nenhum pedido ainda</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {orders.map(o => (
                <div key={o.id} className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs line-clamp-1">{o.productName}</p>
                      <p className="text-gray-500 text-xs">{o.customerName} · {o.quantity}x · <span className="font-bold text-[#003B4A]">R$ {Number(o.totalAmount).toFixed(2).replace('.', ',')}</span></p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                  {o.status === 'pending' && (
                    <div className="flex gap-1.5">
                      <button onClick={() => updateOrderStatus(o.id, 'confirmed')}
                        className="flex-1 text-[11px] py-1 rounded-lg bg-green-50 text-green-600 font-semibold hover:bg-green-100 transition-colors">
                        Confirmar
                      </button>
                      <button onClick={() => updateOrderStatus(o.id, 'cancelled')}
                        className="flex-1 text-[11px] py-1 rounded-lg bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {buyTarget && (
        <BuyModal
          product={buyTarget}
          onClose={() => setBuyTarget(null)}
          onSuccess={() => { loadProducts(); setBuyTarget(null); }}
        />
      )}
      {editTarget !== null && (
        <ProductFormModal
          organizerId={organizerId}
          product={editTarget === 'new' ? null : editTarget}
          events={events}
          onClose={() => setEditTarget(null)}
          onSaved={loadProducts}
        />
      )}
    </aside>
  );
}

// ─── Page Client ──────────────────────────────────────────────────────────────
type Tab = 'feed' | 'upcoming' | 'past';

interface Props {
  initialOrganizer: Organizer;
}

export default function OrganizerProfileClient({ initialOrganizer }: Props) {
  const router = useRouter();
  const organizerId = initialOrganizer.id;

  const [organizer, setOrganizer] = useState<Organizer>(initialOrganizer);
  const [events, setEvents]       = useState<OrgEvent[]>([]);
  const [posts, setPosts]         = useState<OrgPost[]>([]);
  const [polls, setPolls]         = useState<OrgPoll[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>('feed');
  const [showModal, setShowModal] = useState(false);

  const userId   = storage.getUserId();
  const hasToken = !!storage.getToken();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, postRes, pollRes] = await Promise.all([
        fetch(`${API_URL}/events/organizer/${organizerId}`),
        fetch(`${API_URL}/organizer-content/${organizerId}/posts`),
        fetch(`${API_URL}/organizer-content/${organizerId}/polls`),
      ]);
      if (evRes.ok)   { const d = await evRes.json(); setEvents(d.events ?? []); }
      if (postRes.ok) setPosts(await postRes.json());
      if (pollRes.ok) setPolls(await pollRes.json());
    } finally { setLoading(false); }
  }, [organizerId]);

  useEffect(() => { load(); }, [load]);

  const isOwner = organizer.userId === userId;

  const now        = new Date();
  const upcoming   = events.filter(e => new Date(e.eventDate) >= now)
                           .sort((a,b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const pastEvents = events.filter(e => new Date(e.eventDate) < now)
                           .sort((a,b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  type FeedItem = { kind:'post'; data:OrgPost } | { kind:'poll'; data:OrgPoll };
  const feed: FeedItem[] = [
    ...posts.map(p => ({ kind:'post' as const, data:p })),
    ...polls.map(p => ({ kind:'poll' as const, data:p })),
  ].sort((a,b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());

  const initial = organizer.companyName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Cover banner ────────────────────────────────────────────────────── */}
      <div className="h-48 md:h-56 relative overflow-hidden">
        {organizer.coverUrl ? (
          <img src={`${API_URL}${organizer.coverUrl}`} alt="Capa" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full"
            style={{ background:'linear-gradient(135deg,#003B4A 0%,#007465 60%,#00C2A8 100%)' }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage:'radial-gradient(circle at 20% 50%,white 1px,transparent 1px),radial-gradient(circle at 80% 20%,white 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>
          </div>
        )}
        <button onClick={() => router.back()}
          className="absolute top-5 left-5 flex items-center gap-2 text-white/80 hover:text-white text-sm bg-black/20 hover:bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all">
          <FaArrowLeft className="text-xs"/> Voltar
        </button>
        {isOwner && (
          <CoverUploadButton organizerId={organizer.id} onUploaded={(url) => setOrganizer(prev => ({ ...prev, coverUrl: url }))} />
        )}
      </div>

      <div className="container mx-auto px-4 max-w-6xl">

        {/* ── Avatar + Info ───────────────────────────────────────────────── */}
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

        {/* ── Card de perfil ──────────────────────────────────────────────── */}
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

        {/* ── Two-column layout ───────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Tabs */}
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

            {/* Loading state for content */}
            {loading && (
              <div className="space-y-4 pb-10">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"/>
                    <div className="h-3 bg-gray-200 rounded w-full"/>
                    <div className="h-3 bg-gray-200 rounded w-2/3"/>
                  </div>
                ))}
              </div>
            )}

            {/* ── Feed ──────────────────────────────────────────────────── */}
            {!loading && tab === 'feed' && (
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
                    {item.kind === 'post' && (
                      <div className="space-y-3">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{item.data.content}</p>
                        {item.data.imageUrl && (
                          <img
                            src={item.data.imageUrl.startsWith('/uploads') ? `${API_URL}${item.data.imageUrl}` : item.data.imageUrl}
                            alt=""
                            className="w-full rounded-xl object-cover max-h-80 border border-gray-100"
                            onError={e => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                        {item.data.linkUrl && (
                          <a
                            href={item.data.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#00C2A8] hover:bg-[#00C2A8]/5 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#00C2A8]/10 flex items-center justify-center flex-shrink-0">
                              <FaLink className="text-[#00C2A8] text-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-[#00C2A8] transition-colors truncate">
                                {item.data.linkTitle || item.data.linkUrl}
                              </p>
                              {item.data.linkTitle && (
                                <p className="text-xs text-gray-400 truncate">{item.data.linkUrl}</p>
                              )}
                            </div>
                          </a>
                        )}
                      </div>
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

            {/* ── Próximos Eventos ──────────────────────────────────────── */}
            {!loading && tab === 'upcoming' && (
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

            {/* ── Eventos Passados ──────────────────────────────────────── */}
            {!loading && tab === 'past' && (
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

          </div>{/* end main column */}

          {/* ── Store aside ─────────────────────────────────────────────── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <StoreAside organizerId={organizerId} isOwner={isOwner} hasToken={hasToken} events={events} />
          </div>

        </div>{/* end two-column layout */}
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <CreateModal organizerId={organizerId} onClose={() => setShowModal(false)} onCreated={load}/>
      )}
    </div>
  );
}
