'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaCheckCircle,
} from 'react-icons/fa';
import { useAuth } from '@/hooks';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Lote {
  name: string;
  description: string;
  price: string;
  quantityAvailable: string;
  ticketType: 'paid' | 'free';
  saleStartDate: string;
  saleEndDate: string;
}

const EMPTY_LOTE: Lote = {
  name: '',
  description: '',
  price: '',
  quantityAvailable: '',
  ticketType: 'paid',
  saleStartDate: '',
  saleEndDate: '',
};

const CATEGORIES = [
  { value: 'music', label: 'Música' },
  { value: 'party', label: 'Festa' },
  { value: 'course', label: 'Curso' },
  { value: 'theater', label: 'Teatro' },
  { value: 'sports', label: 'Esportes' },
  { value: 'conference', label: 'Conferência' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'festival', label: 'Festival' },
  { value: 'other', label: 'Outros' },
];

type Step = 'event' | 'tickets' | 'review';

export default function NewEventPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [step, setStep] = useState<Step>('event');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);

  const [event, setEvent] = useState({
    title: '',
    description: '',
    category: 'music',
    eventDate: '',
    eventEndDate: '',
    locationType: 'presencial',
    venueName: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    onlineUrl: '',
    bannerUrl: '',
    maxAttendees: '',
    isPublished: false,
  });

  const [lotes, setLotes] = useState<Lote[]>([{ ...EMPTY_LOTE }]);

  const setEventField = (k: string, v: string | boolean) =>
    setEvent((prev) => ({ ...prev, [k]: v }));

  const setLoteField = (idx: number, k: keyof Lote, v: string) =>
    setLotes((prev) => prev.map((l, i) => (i === idx ? { ...l, [k]: v } : l)));

  const addLote = () => setLotes((prev) => [...prev, { ...EMPTY_LOTE }]);
  const removeLote = (idx: number) =>
    setLotes((prev) => prev.filter((_, i) => i !== idx));

  const validateEvent = () => {
    if (!event.title.trim()) return 'Título é obrigatório';
    if (!event.category) return 'Categoria é obrigatória';
    if (!event.eventDate) return 'Data do evento é obrigatória';
    return null;
  };

  const validateLotes = () => {
    for (const l of lotes) {
      if (!l.name.trim()) return 'Todos os lotes precisam de nome';
      if (l.ticketType === 'paid' && (!l.price || Number(l.price) < 0))
        return 'Preço inválido em um dos lotes';
      if (!l.quantityAvailable || Number(l.quantityAvailable) < 1)
        return 'Quantidade deve ser maior que 0';
    }
    return null;
  };

  const handleNextToTickets = () => {
    const err = validateEvent();
    if (err) { setError(err); return; }
    setError(null);
    setStep('tickets');
  };

  const handleNextToReview = () => {
    const err = validateLotes();
    if (err) { setError(err); return; }
    setError(null);
    setStep('review');
  };

  const handleSubmit = async () => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }

    setLoading(true);
    setError(null);

    try {
      // 1. Criar evento
      const evtRes = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...event,
          organizerId: 1, // TODO: pegar do organizador logado
          maxAttendees: event.maxAttendees ? Number(event.maxAttendees) : undefined,
          status: event.isPublished ? 'published' : 'draft',
          isPublic: true,
          isPublished: event.isPublished,
        }),
      });

      if (!evtRes.ok) {
        const d = await evtRes.json().catch(() => ({}));
        throw new Error(d.message ?? 'Erro ao criar evento');
      }

      const evtData = await evtRes.json();
      const eventId: number = evtData.event?.id ?? evtData.id;
      setCreatedEventId(eventId);

      // 2. Criar lotes
      for (const lote of lotes) {
        const ticketRes = await fetch(`${API_URL}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            eventId,
            name: lote.name.trim(),
            description: lote.description.trim() || undefined,
            price: lote.ticketType === 'free' ? 0 : Number(lote.price),
            quantityAvailable: Number(lote.quantityAvailable),
            ticketType: lote.ticketType,
            saleStartDate: lote.saleStartDate || undefined,
            saleEndDate: lote.saleEndDate || undefined,
            isActive: true,
          }),
        });

        if (!ticketRes.ok) {
          const d = await ticketRes.json().catch(() => ({}));
          throw new Error(d.message ?? 'Erro ao criar lote');
        }
      }

      setStep('review');
      setTimeout(() => router.push('/organizer/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const STEPS: { key: Step; label: string }[] = [
    { key: 'event', label: 'Informações' },
    { key: 'tickets', label: 'Lotes' },
    { key: 'review', label: 'Publicar' },
  ];

  const stepIdx = STEPS.findIndex((s) => s.key === step);

  if (createdEventId && step === 'review') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Evento criado!</h2>
          <p className="text-gray-500 text-sm">Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-8" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <button
            onClick={() => step === 'event' ? router.back() : setStep(step === 'tickets' ? 'event' : 'tickets')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors"
          >
            <FaArrowLeft /> Voltar
          </button>
          <h1 className="text-2xl font-bold">Criar Novo Evento</h1>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= stepIdx ? 'bg-white text-[#003B4A]' : 'bg-white/20 text-white/60'}`}>
                  {i < stepIdx ? <FaCheckCircle className="text-[#00C2A8]" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:block ${i <= stepIdx ? 'text-white font-semibold' : 'text-white/60'}`}>{s.label}</span>
                {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${i < stepIdx ? 'bg-white' : 'bg-white/30'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* ===== STEP 1: Informações do Evento ===== */}
        {step === 'event' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaCalendarAlt className="text-[#00C2A8]" /> Informações do Evento
            </h2>

            <div>
              <label className="label-form">Título do evento *</label>
              <input type="text" className="input-form" placeholder="Ex: Festival de Música Eletrônica 2025"
                value={event.title} onChange={(e) => setEventField('title', e.target.value)} />
            </div>

            <div>
              <label className="label-form">Descrição</label>
              <textarea rows={4} className="input-form resize-none" placeholder="Descreva seu evento..."
                value={event.description} onChange={(e) => setEventField('description', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-form">Categoria *</label>
                <select className="input-form" value={event.category} onChange={(e) => setEventField('category', e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label-form">Formato</label>
                <select className="input-form" value={event.locationType} onChange={(e) => setEventField('locationType', e.target.value)}>
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                  <option value="híbrido">Híbrido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-form">Data de início *</label>
                <input type="datetime-local" className="input-form"
                  value={event.eventDate} onChange={(e) => setEventField('eventDate', e.target.value)} />
              </div>
              <div>
                <label className="label-form">Data de término</label>
                <input type="datetime-local" className="input-form"
                  value={event.eventEndDate} onChange={(e) => setEventField('eventEndDate', e.target.value)} />
              </div>
            </div>

            {event.locationType !== 'online' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#00C2A8]" /> Local
                </h3>
                <div>
                  <label className="label-form">Nome do local</label>
                  <input type="text" className="input-form" placeholder="Ex: Allianz Parque"
                    value={event.venueName} onChange={(e) => setEventField('venueName', e.target.value)} />
                </div>
                <div>
                  <label className="label-form">Endereço</label>
                  <input type="text" className="input-form" placeholder="Rua, número"
                    value={event.address} onChange={(e) => setEventField('address', e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="label-form">Cidade</label>
                    <input type="text" className="input-form" value={event.city}
                      onChange={(e) => setEventField('city', e.target.value)} />
                  </div>
                  <div>
                    <label className="label-form">UF</label>
                    <input type="text" maxLength={2} className="input-form uppercase" value={event.state}
                      onChange={(e) => setEventField('state', e.target.value.toUpperCase())} />
                  </div>
                </div>
              </div>
            )}

            {event.locationType !== 'presencial' && (
              <div>
                <label className="label-form">URL do evento online</label>
                <input type="url" className="input-form" placeholder="https://..."
                  value={event.onlineUrl} onChange={(e) => setEventField('onlineUrl', e.target.value)} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-form">Capacidade máxima</label>
                <input type="number" min="1" className="input-form" placeholder="Ex: 500"
                  value={event.maxAttendees} onChange={(e) => setEventField('maxAttendees', e.target.value)} />
              </div>
              <div>
                <label className="label-form">URL do banner</label>
                <input type="url" className="input-form" placeholder="https://..."
                  value={event.bannerUrl} onChange={(e) => setEventField('bannerUrl', e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#00C2A8]/5 rounded-xl border border-[#00C2A8]/20">
              <input type="checkbox" id="publish" checked={event.isPublished}
                onChange={(e) => setEventField('isPublished', e.target.checked)}
                className="w-4 h-4 accent-[#00C2A8]" />
              <label htmlFor="publish" className="text-sm font-medium text-gray-700 cursor-pointer">
                Publicar imediatamente (visível para todos)
              </label>
            </div>

            <button onClick={handleNextToTickets}
              className="w-full py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: '#00C2A8' }}>
              Próximo: Criar Lotes
            </button>
          </div>
        )}

        {/* ===== STEP 2: Lotes ===== */}
        {step === 'tickets' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-5">
                <FaTicketAlt className="text-[#00C2A8]" /> Lotes de Ingressos
              </h2>

              <div className="space-y-4">
                {lotes.map((lote, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-5 space-y-4 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Lote {idx + 1}</span>
                      {lotes.length > 1 && (
                        <button onClick={() => removeLote(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="label-form">Nome do lote *</label>
                        <input type="text" className="input-form" placeholder="Ex: Pista, VIP, Meia"
                          value={lote.name} onChange={(e) => setLoteField(idx, 'name', e.target.value)} />
                      </div>
                      <div>
                        <label className="label-form">Descrição</label>
                        <input type="text" className="input-form" placeholder="Descrição opcional"
                          value={lote.description} onChange={(e) => setLoteField(idx, 'description', e.target.value)} />
                      </div>
                      <div>
                        <label className="label-form">Tipo</label>
                        <select className="input-form" value={lote.ticketType}
                          onChange={(e) => setLoteField(idx, 'ticketType', e.target.value as 'paid' | 'free')}>
                          <option value="paid">Pago</option>
                          <option value="free">Gratuito</option>
                        </select>
                      </div>
                      {lote.ticketType === 'paid' && (
                        <div>
                          <label className="label-form">Preço (R$) *</label>
                          <input type="number" min="0" step="0.01" className="input-form" placeholder="0,00"
                            value={lote.price} onChange={(e) => setLoteField(idx, 'price', e.target.value)} />
                        </div>
                      )}
                      <div>
                        <label className="label-form">Quantidade *</label>
                        <input type="number" min="1" className="input-form" placeholder="100"
                          value={lote.quantityAvailable} onChange={(e) => setLoteField(idx, 'quantityAvailable', e.target.value)} />
                      </div>
                      <div>
                        <label className="label-form">Início das vendas</label>
                        <input type="datetime-local" className="input-form"
                          value={lote.saleStartDate} onChange={(e) => setLoteField(idx, 'saleStartDate', e.target.value)} />
                      </div>
                      <div>
                        <label className="label-form">Fim das vendas</label>
                        <input type="datetime-local" className="input-form"
                          value={lote.saleEndDate} onChange={(e) => setLoteField(idx, 'saleEndDate', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addLote}
                className="w-full mt-4 py-3 border-2 border-dashed border-[#00C2A8]/40 text-[#00C2A8] rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-[#00C2A8] hover:bg-[#00C2A8]/5 transition-all">
                <FaPlus /> Adicionar Lote
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('event')}
                className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-all">
                Voltar
              </button>
              <button onClick={handleNextToReview}
                className="flex-1 py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#00C2A8' }}>
                Revisar e Publicar
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Revisão / Publicar ===== */}
        {step === 'review' && !createdEventId && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Revisar Evento</h2>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Título</span><p className="font-semibold text-gray-800">{event.title}</p></div>
                <div><span className="text-gray-400">Categoria</span><p className="font-semibold text-gray-800 capitalize">{event.category}</p></div>
                <div><span className="text-gray-400">Data</span><p className="font-semibold text-gray-800">{event.eventDate ? new Date(event.eventDate).toLocaleString('pt-BR') : '-'}</p></div>
                <div><span className="text-gray-400">Local</span><p className="font-semibold text-gray-800">{event.venueName || event.city || event.locationType}</p></div>
                <div><span className="text-gray-400">Status</span><p className={`font-semibold ${event.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>{event.isPublished ? 'Publicado' : 'Rascunho'}</p></div>
                <div><span className="text-gray-400">Lotes</span><p className="font-semibold text-gray-800">{lotes.length} lote(s)</p></div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Lotes</h3>
                <div className="space-y-2">
                  {lotes.map((l, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 text-sm">
                      <div>
                        <span className="font-semibold text-gray-800">{l.name}</span>
                        <span className="text-gray-400 ml-2">· {l.quantityAvailable} ingressos</span>
                      </div>
                      <span className="font-bold" style={{ color: '#00C2A8' }}>
                        {l.ticketType === 'free' ? 'Grátis' : `R$ ${Number(l.price).toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('tickets')}
                className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-all">
                Voltar
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#00C2A8' }}>
                {loading ? 'Publicando...' : 'Criar Evento'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .label-form { display: block; font-size: 0.8125rem; font-weight: 600; color: #374151; margin-bottom: 0.375rem; }
        .input-form { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #E5E7EB; border-radius: 0.75rem; font-size: 0.875rem; outline: none; transition: all 0.15s; background: white; }
        .input-form:focus { border-color: #00C2A8; box-shadow: 0 0 0 3px rgba(0,194,168,0.1); }
      `}</style>
    </div>
  );
}
