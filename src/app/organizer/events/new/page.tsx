'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaCheckCircle,
  FaSearch,
  FaImages,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '@/hooks';
import { storage } from '@/lib/utils/storage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast, ToastContainer } from '@/components/ui/Toast';

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

const displayBRL = (cents: string): string => {
  if (!cents) return '';
  const num = parseInt(cents, 10);
  if (isNaN(num)) return '';
  return 'R$ ' + (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
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

type EventFieldErrors = {
  title?: string;
  eventDate?: string;
  eventEndDate?: string;
};

const DT_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateDatetime(value: string): 'missing' | 'missing-time' | 'invalid' | 'valid' {
  if (!value) return 'missing';
  if (DT_REGEX.test(value)) return isNaN(new Date(value).getTime()) ? 'invalid' : 'valid';
  if (DATE_ONLY_REGEX.test(value)) return 'missing-time';
  return 'invalid';
}

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export default function NewEventPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [step, setStep] = useState<Step>('event');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<EventFieldErrors>({});
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);
  const [organizerId, setOrganizerId] = useState<number | null>(null);

  const [cepLoading, setCepLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const token = getToken();
    const userId = storage.getUserId();
    if (!token || !userId) return;
    fetch(`${API_URL}/organizers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const orgs: Array<{ id: number; userId: number }> = data.organizers ?? data;
        const myOrg = Array.isArray(orgs) ? orgs.find((o) => o.userId === userId) : null;
        if (myOrg) setOrganizerId(myOrg.id);
      })
      .catch(() => null);
  }, [getToken]);

  const [event, setEvent] = useState({
    title: '',
    description: '',
    category: 'music',
    eventDate: '',
    eventEndDate: '',
    locationType: 'presencial',
    venueName: '',
    address: '',
    complement: '',
    city: '',
    state: '',
    zipcode: '',
    onlineUrl: '',
    maxAttendees: '',
    isPublished: false,
  });

  const [lotes, setLotes] = useState<Lote[]>([{ ...EMPTY_LOTE }]);

  const setEventField = (k: string, v: string | boolean) => {
    setEvent((prev) => ({ ...prev, [k]: v }));
    if (k === 'title' || k === 'eventDate' || k === 'eventEndDate') {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n[k as keyof EventFieldErrors];
        return n;
      });
    }
  };

  const setLoteField = (idx: number, k: keyof Lote, v: string) =>
    setLotes((prev) => prev.map((l, i) => (i === idx ? { ...l, [k]: v } : l)));

  const handlePriceInput = (idx: number, val: string) => {
    const digits = val.replace(/\D/g, '');
    setLoteField(idx, 'price', digits);
  };

  const addLote = () => setLotes((prev) => [...prev, { ...EMPTY_LOTE }]);
  const removeLote = (idx: number) => setLotes((prev) => prev.filter((_, i) => i !== idx));

  const handleCepBlur = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEvent((prev) => ({
          ...prev,
          address: data.logradouro ?? prev.address,
          city: data.localidade ?? prev.city,
          state: data.uf ?? prev.state,
        }));
      }
    } catch {
      /* ignora */
    } finally {
      setCepLoading(false);
    }
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 10 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateEventFields = (): EventFieldErrors => {
    const errs: EventFieldErrors = {};
    if (!event.title.trim()) errs.title = 'Título é obrigatório';

    const startStatus = validateDatetime(event.eventDate);
    if (startStatus === 'missing') errs.eventDate = 'Data de início é obrigatória';
    else if (startStatus === 'missing-time') errs.eventDate = 'Informe também o horário de início';
    else if (startStatus === 'invalid') errs.eventDate = 'Data de início inválida';

    if (event.eventEndDate) {
      const endStatus = validateDatetime(event.eventEndDate);
      if (endStatus === 'missing-time') errs.eventEndDate = 'Informe também o horário de término';
      else if (endStatus === 'invalid') errs.eventEndDate = 'Data de término inválida';
      else if (endStatus === 'valid' && !errs.eventDate) {
        if (new Date(event.eventEndDate) <= new Date(event.eventDate))
          errs.eventEndDate = 'A data de término deve ser posterior à data de início';
      }
    }

    return errs;
  };

  const validateLotes = () => {
    for (const l of lotes) {
      if (!l.name.trim()) return 'Todos os lotes precisam de nome';
      if (l.ticketType === 'paid' && (!l.price || parseInt(l.price, 10) <= 0))
        return 'Preço inválido em um dos lotes';
      if (!l.quantityAvailable || Number(l.quantityAvailable) < 1)
        return 'Quantidade deve ser maior que 0';
      if (
        l.saleStartDate &&
        l.saleEndDate &&
        new Date(l.saleEndDate) <= new Date(l.saleStartDate)
      )
        return `Lote "${l.name}": fim das vendas deve ser posterior ao início`;
    }
    return null;
  };

  const handleNextToTickets = () => {
    const errs = validateEventFields();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstMsg = Object.values(errs)[0]!;
      toast.error(firstMsg);
      scrollTop();
      return;
    }
    setFieldErrors({});
    setStep('tickets');
  };

  const handleNextToReview = () => {
    const err = validateLotes();
    if (err) {
      toast.error(err);
      scrollTop();
      return;
    }
    setStep('review');
  };

  const handleSubmit = async () => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    setLoading(true);

    if (!organizerId) {
      toast.error('Perfil de organizador não encontrado. Acesse seu perfil e complete o cadastro.');
      scrollTop();
      setLoading(false);
      return;
    }

    try {
      const str = (v: string) => v.trim() || undefined;

      const evtRes = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          organizerId,
          title: event.title,
          description: event.description,
          category: event.category,
          eventDate: event.eventDate,
          eventEndDate: event.eventEndDate || undefined,
          locationType: event.locationType,
          venueName: str(event.venueName),
          address: str(event.address),
          complement: str(event.complement),
          city: str(event.city),
          state: str(event.state),
          zipcode: str(event.zipcode),
          onlineUrl: str(event.onlineUrl),
          bannerUrl: undefined,
          maxAttendees: event.maxAttendees ? Number(event.maxAttendees) : undefined,
          isPublic: event.isPublished,
        }),
      });

      if (!evtRes.ok) {
        const d = await evtRes.json().catch(() => ({}));
        throw new Error(d.message ?? 'Erro ao criar evento');
      }

      const evtData = await evtRes.json();
      const eventId: number = evtData.event?.id ?? evtData.id;
      setCreatedEventId(eventId);

      for (const lote of lotes) {
        const ticketRes = await fetch(`${API_URL}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            eventId,
            name: lote.name.trim(),
            description: lote.description.trim() || undefined,
            price: lote.ticketType === 'free' ? 0 : parseInt(lote.price || '0', 10) / 100,
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

      toast.success('Evento criado com sucesso!');
      setStep('review');
      setTimeout(() => router.push('/organizer/dashboard'), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado';
      toast.error(msg);
      scrollTop();
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
      <DashboardLayout userRole="organizer">
        <ToastContainer toasts={toasts} dismiss={dismiss} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Evento criado!</h2>
            <p className="text-gray-500 text-sm">Redirecionando para o dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="organizer">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div
          className="text-white py-6 px-6"
          style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}
        >
          <h1 className="text-2xl font-bold mb-4">Criar Novo Evento</h1>
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i <= stepIdx ? 'bg-white text-[#003B4A]' : 'bg-white/20 text-white/60'
                  }`}
                >
                  {i < stepIdx ? <FaCheckCircle className="text-[#00C2A8]" /> : i + 1}
                </div>
                <span
                  className={`text-sm hidden sm:block ${
                    i <= stepIdx ? 'text-white font-semibold' : 'text-white/60'
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 ${i < stepIdx ? 'bg-white' : 'bg-white/30'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* ─── STEP 1: duas colunas ─── */}
          {step === 'event' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Coluna esquerda — dados principais */}
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FaCalendarAlt className="text-[#00C2A8]" /> Informações do Evento
                </h2>

                <div>
                  <label className="label-form">Título do evento *</label>
                  <input
                    type="text"
                    className={`input-form ${fieldErrors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
                    placeholder="Ex: Festival de Música Eletrônica 2025"
                    value={event.title}
                    onChange={(e) => setEventField('title', e.target.value)}
                  />
                  {fieldErrors.title && (
                    <p className="mt-1.5 text-xs text-red-600">{fieldErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="label-form">Descrição</label>
                  <textarea
                    rows={3}
                    className="input-form resize-none"
                    placeholder="Descreva seu evento..."
                    value={event.description}
                    onChange={(e) => setEventField('description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-form">Categoria *</label>
                    <select
                      className="input-form"
                      value={event.category}
                      onChange={(e) => setEventField('category', e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-form">Formato</label>
                    <select
                      className="input-form"
                      value={event.locationType}
                      onChange={(e) => setEventField('locationType', e.target.value)}
                    >
                      <option value="presencial">Presencial</option>
                      <option value="online">Online</option>
                      <option value="híbrido">Híbrido</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-form">Data de início *</label>
                    <input
                      type="datetime-local"
                      className={`input-form ${fieldErrors.eventDate ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
                      value={event.eventDate}
                      onChange={(e) => setEventField('eventDate', e.target.value)}
                    />
                    {fieldErrors.eventDate && (
                      <p className="mt-1.5 text-xs text-red-600">{fieldErrors.eventDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="label-form">Data de término</label>
                    <input
                      type="datetime-local"
                      className={`input-form ${fieldErrors.eventEndDate ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
                      value={event.eventEndDate}
                      onChange={(e) => setEventField('eventEndDate', e.target.value)}
                    />
                    {fieldErrors.eventEndDate && (
                      <p className="mt-1.5 text-xs text-red-600">{fieldErrors.eventEndDate}</p>
                    )}
                  </div>
                </div>

                {event.locationType !== 'presencial' && (
                  <div>
                    <label className="label-form">URL do evento online</label>
                    <input
                      type="url"
                      className="input-form"
                      placeholder="https://..."
                      value={event.onlineUrl}
                      onChange={(e) => setEventField('onlineUrl', e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="label-form">Capacidade máxima</label>
                  <input
                    type="number"
                    min="1"
                    className="input-form"
                    placeholder="Ex: 500"
                    value={event.maxAttendees}
                    onChange={(e) => setEventField('maxAttendees', e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#00C2A8]/5 rounded-xl border border-[#00C2A8]/20">
                  <input
                    type="checkbox"
                    id="publish"
                    checked={event.isPublished}
                    onChange={(e) => setEventField('isPublished', e.target.checked)}
                    className="w-4 h-4 accent-[#00C2A8]"
                  />
                  <label htmlFor="publish" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Publicar imediatamente (visível para todos)
                  </label>
                </div>

                <button
                  onClick={handleNextToTickets}
                  className="w-full py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90"
                  style={{ backgroundColor: '#00C2A8' }}
                >
                  Próximo: Criar Lotes
                </button>
              </div>

              {/* Coluna direita — local + imagens */}
              <div className="space-y-6">
                {event.locationType !== 'online' && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-[#00C2A8]" /> Local
                    </h3>

                    <div>
                      <label className="label-form">Nome do local</label>
                      <input
                        type="text"
                        className="input-form"
                        placeholder="Ex: Allianz Parque"
                        value={event.venueName}
                        onChange={(e) => setEventField('venueName', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="label-form">CEP</label>
                        <div className="relative">
                          <input
                            type="text"
                            className="input-form"
                            maxLength={9}
                            placeholder="00000-000"
                            value={event.zipcode}
                            onChange={(e) => setEventField('zipcode', e.target.value)}
                            onBlur={(e) => handleCepBlur(e.target.value)}
                          />
                          {cepLoading && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 flex items-center gap-1">
                              <FaSearch className="animate-spin" /> buscando...
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="label-form">Endereço</label>
                        <input
                          type="text"
                          className="input-form"
                          placeholder="Rua, número"
                          value={event.address}
                          onChange={(e) => setEventField('address', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label-form">Complemento</label>
                      <input
                        type="text"
                        className="input-form"
                        placeholder="Apto, bloco, sala, etc."
                        value={event.complement}
                        onChange={(e) => setEventField('complement', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="label-form">Cidade</label>
                        <input
                          type="text"
                          className="input-form"
                          value={event.city}
                          onChange={(e) => setEventField('city', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label-form">UF</label>
                        <input
                          type="text"
                          maxLength={2}
                          className="input-form uppercase"
                          value={event.state}
                          onChange={(e) => setEventField('state', e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Imagens */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
                  <label className="label-form flex items-center gap-2 !mb-0">
                    <FaImages className="text-[#00C2A8]" /> Imagens do evento (até 10)
                  </label>
                  <p className="text-xs text-gray-400">A primeira imagem será usada como capa.</p>

                  <label className="block w-full border-2 border-dashed border-[#00C2A8]/40 rounded-xl p-5 text-center cursor-pointer hover:border-[#00C2A8] hover:bg-[#00C2A8]/5 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageFiles(e.target.files)}
                    />
                    <FaImages className="text-2xl text-[#00C2A8]/50 mx-auto mb-1.5" />
                    <p className="text-sm text-gray-500">Clique ou arraste imagens aqui</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP • Máx. 5 MB</p>
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative group">
                          {i === 0 && (
                            <span className="absolute top-1 left-1 z-10 text-[10px] font-bold bg-[#00C2A8] text-white px-1.5 py-0.5 rounded">
                              CAPA
                            </span>
                          )}
                          <img
                            src={src}
                            alt=""
                            className="w-full h-20 object-cover rounded-xl border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Lotes ─── */}
          {step === 'tickets' && (
            <div className="max-w-4xl space-y-4">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-5">
                  <FaTicketAlt className="text-[#00C2A8]" /> Lotes de Ingressos
                </h2>

                <div className="space-y-4">
                  {lotes.map((lote, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Lote {idx + 1}</span>
                        {lotes.length > 1 && (
                          <button
                            onClick={() => removeLote(idx)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="label-form">Nome do lote *</label>
                          <input
                            type="text"
                            className="input-form"
                            placeholder="Ex: Pista, VIP, Meia"
                            value={lote.name}
                            onChange={(e) => setLoteField(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label-form">Descrição</label>
                          <input
                            type="text"
                            className="input-form"
                            placeholder="Descrição opcional"
                            value={lote.description}
                            onChange={(e) => setLoteField(idx, 'description', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label-form">Tipo</label>
                          <select
                            className="input-form"
                            value={lote.ticketType}
                            onChange={(e) =>
                              setLoteField(idx, 'ticketType', e.target.value as 'paid' | 'free')
                            }
                          >
                            <option value="paid">Pago</option>
                            <option value="free">Gratuito</option>
                          </select>
                        </div>
                        {lote.ticketType === 'paid' && (
                          <div>
                            <label className="label-form">Preço (R$) *</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              className="input-form"
                              placeholder="R$ 0,00"
                              value={displayBRL(lote.price)}
                              onChange={(e) => handlePriceInput(idx, e.target.value)}
                            />
                          </div>
                        )}
                        <div>
                          <label className="label-form">Quantidade *</label>
                          <input
                            type="number"
                            min="1"
                            className="input-form"
                            placeholder="100"
                            value={lote.quantityAvailable}
                            onChange={(e) => setLoteField(idx, 'quantityAvailable', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label-form">Início das vendas</label>
                          <input
                            type="datetime-local"
                            className="input-form"
                            value={lote.saleStartDate}
                            onChange={(e) => setLoteField(idx, 'saleStartDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label-form">Fim das vendas</label>
                          <input
                            type="datetime-local"
                            className="input-form"
                            value={lote.saleEndDate}
                            onChange={(e) => setLoteField(idx, 'saleEndDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addLote}
                  className="w-full mt-4 py-3 border-2 border-dashed border-[#00C2A8]/40 text-[#00C2A8] rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-[#00C2A8] hover:bg-[#00C2A8]/5 transition-all"
                >
                  <FaPlus /> Adicionar Lote
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('event')}
                  className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleNextToReview}
                  className="flex-1 py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90"
                  style={{ backgroundColor: '#00C2A8' }}
                >
                  Revisar e Publicar
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Revisão ─── */}
          {step === 'review' && !createdEventId && (
            <div className="max-w-4xl space-y-4">
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Revisar Evento</h2>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Título</span>
                    <p className="font-semibold text-gray-800">{event.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Categoria</span>
                    <p className="font-semibold text-gray-800 capitalize">{event.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Data</span>
                    <p className="font-semibold text-gray-800">
                      {event.eventDate ? new Date(event.eventDate).toLocaleString('pt-BR') : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Local</span>
                    <p className="font-semibold text-gray-800">
                      {event.venueName || event.city || event.locationType}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Status</span>
                    <p className={`font-semibold ${event.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                      {event.isPublished ? 'Publicado' : 'Rascunho'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Imagens</span>
                    <p className="font-semibold text-gray-800">{imagePreviews.length} foto(s)</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Lotes</span>
                    <p className="font-semibold text-gray-800">{lotes.length} lote(s)</p>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {imagePreviews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="w-full h-16 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Lotes</h3>
                  <div className="space-y-2">
                    {lotes.map((l, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 text-sm"
                      >
                        <div>
                          <span className="font-semibold text-gray-800">{l.name}</span>
                          <span className="text-gray-400 ml-2">· {l.quantityAvailable} ingressos</span>
                        </div>
                        <span className="font-bold" style={{ color: '#00C2A8' }}>
                          {l.ticketType === 'free' ? 'Grátis' : displayBRL(l.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('tickets')}
                  className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#00C2A8' }}
                >
                  {loading ? 'Publicando...' : 'Criar Evento'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
