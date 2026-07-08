'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSave,
  FaCheckCircle,
  FaSearch,
  FaImages,
  FaTimes,
  FaTicketAlt,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';
import { useAuth } from '@/hooks';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast, ToastContainer } from '@/components/ui/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

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

interface LoteEdit {
  id?: number;
  name: string;
  description: string;
  price: string;
  quantityAvailable: string;
  ticketType: 'paid' | 'free';
  saleStartDate: string;
  saleEndDate: string;
  isNew?: boolean;
  toDelete?: boolean;
}

type EditFieldErrors = { title?: string; eventDate?: string; eventEndDate?: string };

const EMPTY_LOTE: LoteEdit = {
  name: '', description: '', price: '', quantityAvailable: '',
  ticketType: 'paid', saleStartDate: '', saleEndDate: '', isNew: true,
};

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateDateOnly(value: string): 'missing' | 'invalid' | 'valid' {
  if (!value) return 'missing';
  if (!DATE_ONLY_REGEX.test(value)) return 'invalid';
  return isNaN(new Date(value).getTime()) ? 'invalid' : 'valid';
}

// Sem horário informado, o evento vale até o fim do dia da data escolhida.
function combineDateTime(date: string, time: string): string {
  return `${date}T${time || '23:59'}`;
}

function toLocalDatetime(iso: string | null | undefined) {
  if (!iso) return '';
  return iso.slice(0, 16);
}

function toLocalDate(iso: string | null | undefined) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function toLocalTime(iso: string | null | undefined) {
  if (!iso) return '';
  return iso.slice(11, 16);
}

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.id);
  const { getToken } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<EditFieldErrors>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const [lotes, setLotes] = useState<LoteEdit[]>([]);

  const [form, setForm] = useState({
    title: '', description: '', category: 'music',
    eventDate: '', eventTime: '', eventEndDate: '', eventEndTime: '',
    locationType: 'presencial',
    venueName: '', address: '', complement: '',
    city: '', state: '', zipcode: '', onlineUrl: '',
    maxAttendees: '', isPublished: false,
  });

  const loadEvent = useCallback(async () => {
    try {
      const token = getToken();
      const [evRes, tkRes] = await Promise.all([
        fetch(`${API_URL}/events/${eventId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch(`${API_URL}/tickets/event/${eventId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      if (!evRes.ok) throw new Error('Evento não encontrado');
      const data = await evRes.json();
      const ev = data.event ?? data;

      const imgs: string[] = (() => {
        if (ev.bannerUrl) {
          try { const p = JSON.parse(ev.bannerUrl); if (Array.isArray(p)) return p; } catch {}
          return [ev.bannerUrl];
        }
        return [];
      })();

      setExistingImageUrls(imgs);
      setImagePreviews(imgs);

      setForm({
        title: ev.title ?? '',
        description: ev.description ?? '',
        category: ev.category ?? 'music',
        eventDate: toLocalDate(ev.eventDate),
        eventTime: toLocalTime(ev.eventDate),
        eventEndDate: toLocalDate(ev.eventEndDate),
        eventEndTime: toLocalTime(ev.eventEndDate),
        locationType: ev.locationType ?? 'presencial',
        venueName: ev.venueName ?? '',
        address: ev.address ?? '',
        complement: ev.complement ?? '',
        city: ev.city ?? '',
        state: ev.state ?? '',
        zipcode: ev.zipcode ?? '',
        onlineUrl: ev.onlineUrl ?? '',
        maxAttendees: ev.maxAttendees != null ? String(ev.maxAttendees) : '',
        isPublished: ev.isPublished ?? false,
      });

      if (tkRes.ok) {
        const tkData = await tkRes.json();
        const tickets = tkData.tickets ?? tkData ?? [];
        setLotes(
          (Array.isArray(tickets) ? tickets : []).map((t: {
            id: number; name: string; description: string; price: number;
            quantityAvailable: number; ticketType: string;
            saleStartDate?: string; saleEndDate?: string;
          }) => ({
            id: t.id,
            name: t.name ?? '',
            description: t.description ?? '',
            price: t.price != null ? String(Math.round(t.price * 100)) : '',
            quantityAvailable: t.quantityAvailable != null ? String(t.quantityAvailable) : '',
            ticketType: (t.ticketType === 'free' ? 'free' : 'paid') as 'paid' | 'free',
            saleStartDate: toLocalDatetime(t.saleStartDate),
            saleEndDate: toLocalDatetime(t.saleEndDate),
          }))
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, getToken]);

  useEffect(() => { loadEvent(); }, [loadEvent]);

  const setField = (k: string, v: string | boolean) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    const errKey = k === 'eventTime' ? 'eventDate' : k === 'eventEndTime' ? 'eventEndDate' : k;
    if (errKey === 'title' || errKey === 'eventDate' || errKey === 'eventEndDate') {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[errKey as keyof EditFieldErrors]; return n; });
    }
  };

  const handleCepBlur = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          address: data.logradouro ?? prev.address,
          city: data.localidade ?? prev.city,
          state: data.uf ?? prev.state,
        }));
      }
    } catch { /* ignora */ } finally { setCepLoading(false); }
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 10 - imageFiles.length - existingImageUrls.length);
    setImageFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    if (idx < existingImageUrls.length) {
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== idx));
      setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    } else {
      const fileIdx = idx - existingImageUrls.length;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIdx));
      setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const setLoteField = (idx: number, k: keyof LoteEdit, v: string) =>
    setLotes((prev) => prev.map((l, i) => (i === idx ? { ...l, [k]: v } : l)));

  const handlePriceInput = (idx: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    setLoteField(idx, 'price', digits);
  };

  const addLote = () => setLotes((prev) => [...prev, { ...EMPTY_LOTE }]);
  const markDelete = (idx: number) =>
    setLotes((prev) => prev.map((l, i) => (i === idx ? { ...l, toDelete: true } : l)));

  const formatPrice = (cents: string) => {
    const n = parseInt(cents || '0', 10);
    return (n / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const handleSave = async () => {
    const errs: EditFieldErrors = {};
    if (!form.title.trim()) errs.title = 'Título é obrigatório';
    const startStatus = validateDateOnly(form.eventDate);
    if (startStatus === 'missing') errs.eventDate = 'Data de início é obrigatória';
    else if (startStatus === 'invalid') errs.eventDate = 'Data de início inválida';
    if (form.eventEndDate) {
      const endStatus = validateDateOnly(form.eventEndDate);
      if (endStatus === 'invalid') errs.eventEndDate = 'Data de término inválida';
      else if (endStatus === 'valid' && !errs.eventDate) {
        const start = new Date(combineDateTime(form.eventDate, form.eventTime));
        const end = new Date(combineDateTime(form.eventEndDate, form.eventEndTime));
        if (end <= start)
          errs.eventEndDate = 'A data de término deve ser posterior à data de início';
      }
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      toast.error(Object.values(errs)[0]!);
      scrollTop();
      return;
    }
    setFieldErrors({});
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    setSaving(true);

    try {
      // 1. Upload de novas imagens para S3
      let bannerUrl: string | undefined;
      const allImageUrls = [...existingImageUrls];
      if (imageFiles.length > 0) {
        setUploadingImg(true);
        const formData = new FormData();
        formData.append('file', imageFiles[0]);
        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        setUploadingImg(false);
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          allImageUrls.push(url);
        } else {
          toast.error('Falha ao fazer upload da imagem');
        }
      }
      if (allImageUrls.length > 0) bannerUrl = allImageUrls[0];

      // 2. Atualiza o evento
      const rawZip = form.zipcode.replace(/\D/g, '');
      const { complement, ...rest } = form;
      const mergedAddress = complement
        ? `${rest.address}${rest.address ? ', ' : ''}${complement}`.replace(/^, /, '')
        : rest.address;

      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          eventDate: form.eventDate
            ? new Date(combineDateTime(form.eventDate, form.eventTime)).toISOString()
            : undefined,
          eventEndDate: form.eventEndDate
            ? new Date(combineDateTime(form.eventEndDate, form.eventEndTime)).toISOString()
            : undefined,
          locationType: form.locationType,
          venueName: form.venueName || undefined,
          address: mergedAddress || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zipcode: rawZip.length === 8 ? rawZip : undefined,
          onlineUrl: form.onlineUrl || undefined,
          bannerUrl,
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
          isPublished: form.isPublished,
          status: form.isPublished ? 'published' : 'draft',
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? 'Erro ao salvar evento');
      }

      // 3. Processa lotes: deletar, atualizar, criar
      const activeLotes = lotes.filter((l) => !l.toDelete);
      const toDeleteLotes = lotes.filter((l) => l.toDelete && l.id);

      await Promise.all(toDeleteLotes.map((l) =>
        fetch(`${API_URL}/tickets/${l.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      ));

      for (const lote of activeLotes) {
        const priceValue = lote.ticketType === 'free' ? 0 : parseInt(lote.price || '0', 10) / 100;
        const body = {
          name: lote.name.trim(),
          description: lote.description.trim() || undefined,
          price: priceValue,
          quantityAvailable: Number(lote.quantityAvailable),
          ticketType: lote.ticketType,
          saleStartDate: lote.saleStartDate || undefined,
          saleEndDate: lote.saleEndDate || undefined,
        };
        if (lote.id) {
          await fetch(`${API_URL}/tickets/${lote.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          });
        } else {
          await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...body, eventId }),
          });
        }
      }

      toast.success('Evento atualizado com sucesso!');
      setSaved(true);
      setTimeout(() => router.push('/organizer/events'), 1800);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro inesperado');
      scrollTop();
    } finally {
      setSaving(false);
      setUploadingImg(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="organizer">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Carregando evento...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (saved) {
    return (
      <DashboardLayout userRole="organizer">
        <ToastContainer toasts={toasts} dismiss={dismiss} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Evento atualizado!</h2>
            <p className="text-gray-500 text-sm">Redirecionando para o dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const visibleLotes = lotes.filter((l) => !l.toDelete);

  return (
    <DashboardLayout userRole="organizer">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="bg-gray-50 min-h-screen">
        <div
          className="text-white py-6 px-6"
          style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}
        >
          <h1 className="text-2xl font-bold">Editar Evento</h1>
        </div>

        <div className="p-6 space-y-6">
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
                  className={`input-form ${fieldErrors.title ? 'border-red-400 focus:border-red-400' : ''}`}
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                />
                {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
              </div>

              <div>
                <label className="label-form">Descrição</label>
                <textarea
                  rows={3}
                  className="input-form resize-none"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-form">Categoria *</label>
                  <select className="input-form" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-form">Formato</label>
                  <select className="input-form" value={form.locationType} onChange={(e) => setField('locationType', e.target.value)}>
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                    <option value="híbrido">Híbrido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-form">Data de início *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className={`input-form ${fieldErrors.eventDate ? 'border-red-400' : ''}`}
                      value={form.eventDate}
                      onChange={(e) => setField('eventDate', e.target.value)}
                    />
                    <input
                      type="time"
                      className="input-form"
                      value={form.eventTime}
                      onChange={(e) => setField('eventTime', e.target.value)}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Hora opcional — sem ela, vale até 23:59 do dia escolhido.
                  </p>
                  {fieldErrors.eventDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.eventDate}</p>}
                </div>
                <div>
                  <label className="label-form">Data de término</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className={`input-form ${fieldErrors.eventEndDate ? 'border-red-400' : ''}`}
                      value={form.eventEndDate}
                      onChange={(e) => setField('eventEndDate', e.target.value)}
                    />
                    <input
                      type="time"
                      className="input-form"
                      value={form.eventEndTime}
                      onChange={(e) => setField('eventEndTime', e.target.value)}
                    />
                  </div>
                  {fieldErrors.eventEndDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.eventEndDate}</p>}
                </div>
              </div>

              {form.locationType !== 'presencial' && (
                <div>
                  <label className="label-form">URL do evento online</label>
                  <input type="url" className="input-form" value={form.onlineUrl} onChange={(e) => setField('onlineUrl', e.target.value)} />
                </div>
              )}

              <div>
                <label className="label-form">Capacidade máxima</label>
                <input type="number" min="1" className="input-form" value={form.maxAttendees} onChange={(e) => setField('maxAttendees', e.target.value)} />
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#00C2A8]/5 rounded-xl border border-[#00C2A8]/20">
                <input
                  type="checkbox"
                  id="publish"
                  checked={form.isPublished}
                  onChange={(e) => setField('isPublished', e.target.checked)}
                  className="w-4 h-4 accent-[#00C2A8]"
                />
                <label htmlFor="publish" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Publicar imediatamente (visível para todos)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => router.push('/organizer/dashboard')}
                  className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#00C2A8' }}
                >
                  <FaSave />
                  {saving ? (uploadingImg ? 'Enviando imagem...' : 'Salvando...') : 'Salvar Alterações'}
                </button>
              </div>
            </div>

            {/* Coluna direita — local + imagens */}
            <div className="space-y-6">
              {form.locationType !== 'online' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[#00C2A8]" /> Local
                  </h3>

                  <div>
                    <label className="label-form">Nome do local</label>
                    <input type="text" className="input-form" value={form.venueName} onChange={(e) => setField('venueName', e.target.value)} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label-form">CEP</label>
                      <div className="relative">
                        <input
                          type="text" className="input-form" maxLength={9} placeholder="00000-000"
                          value={form.zipcode}
                          onChange={(e) => setField('zipcode', e.target.value)}
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
                      <input type="text" className="input-form" value={form.address} onChange={(e) => setField('address', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="label-form">Complemento</label>
                    <input type="text" className="input-form" placeholder="Apto, bloco, sala..." value={form.complement} onChange={(e) => setField('complement', e.target.value)} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="label-form">Cidade</label>
                      <input type="text" className="input-form" value={form.city} onChange={(e) => setField('city', e.target.value)} />
                    </div>
                    <div>
                      <label className="label-form">UF</label>
                      <input type="text" maxLength={2} className="input-form uppercase" value={form.state} onChange={(e) => setField('state', e.target.value.toUpperCase())} />
                    </div>
                  </div>
                </div>
              )}

              {/* Imagens */}
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
                <label className="label-form flex items-center gap-2 !mb-0">
                  <FaImages className="text-[#00C2A8]" /> Imagens do evento
                </label>
                <p className="text-xs text-gray-400">A primeira imagem será usada como capa.</p>

                <label className="block w-full border-2 border-dashed border-[#00C2A8]/40 rounded-xl p-5 text-center cursor-pointer hover:border-[#00C2A8] hover:bg-[#00C2A8]/5 transition-all">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageFiles(e.target.files)} />
                  <FaImages className="text-2xl text-[#00C2A8]/50 mx-auto mb-1.5" />
                  <p className="text-sm text-gray-500">Clique ou arraste imagens aqui</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP • Máx. 5 MB</p>
                </label>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        {i === 0 && (
                          <span className="absolute top-1 left-1 z-10 text-[10px] font-bold bg-[#00C2A8] text-white px-1.5 py-0.5 rounded">CAPA</span>
                        )}
                        <img src={src} alt="" className="w-full h-20 object-cover rounded-xl border border-gray-200" />
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

          {/* Lotes / Ingressos */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaTicketAlt className="text-[#00C2A8]" /> Lotes de Ingressos
              </h2>
              <button
                onClick={addLote}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[#00C2A8] text-[#00C2A8] hover:bg-[#00C2A8] hover:text-white transition-all"
              >
                <FaPlus /> Adicionar lote
              </button>
            </div>

            {visibleLotes.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhum lote cadastrado. Clique em "Adicionar lote" para criar.</p>
            ) : (
              <div className="space-y-4">
                {lotes.map((lote, idx) => {
                  if (lote.toDelete) return null;
                  return (
                    <div key={idx} className="border border-gray-200 rounded-xl p-5 space-y-4 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">
                          {lote.id ? `Lote #${lote.id}` : 'Novo lote'}
                          {lote.isNew && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Novo</span>}
                        </span>
                        <button
                          onClick={() => markDelete(idx)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Remover lote"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label-form">Nome do lote *</label>
                          <input
                            type="text"
                            className="input-form"
                            placeholder="Ex: 1º Lote, VIP, Meia-entrada"
                            value={lote.name}
                            onChange={(e) => setLoteField(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label-form">Tipo</label>
                          <select
                            className="input-form"
                            value={lote.ticketType}
                            onChange={(e) => setLoteField(idx, 'ticketType', e.target.value as 'paid' | 'free')}
                          >
                            <option value="paid">Pago</option>
                            <option value="free">Gratuito</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {lote.ticketType === 'paid' && (
                          <div>
                            <label className="label-form">Preço</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                              <input
                                type="text"
                                className="input-form pl-9"
                                placeholder="0,00"
                                value={lote.price ? formatPrice(lote.price) : ''}
                                onFocus={(e) => { e.target.value = lote.price || ''; }}
                                onBlur={(e) => { e.target.value = lote.price ? formatPrice(lote.price) : ''; }}
                                onChange={(e) => handlePriceInput(idx, e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="label-form">Quantidade disponível</label>
                          <input
                            type="number"
                            min="1"
                            className="input-form"
                            value={lote.quantityAvailable}
                            onChange={(e) => setLoteField(idx, 'quantityAvailable', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="label-form">Descrição do lote (opcional)</label>
                        <input
                          type="text"
                          className="input-form"
                          placeholder="Ex: Válido apenas para estudantes"
                          value={lote.description}
                          onChange={(e) => setLoteField(idx, 'description', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
