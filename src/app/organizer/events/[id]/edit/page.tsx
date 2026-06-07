'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaCalendarAlt, FaMapMarkerAlt, FaSave, FaCheckCircle, FaSearch, FaImages, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/hooks';
import DashboardLayout from '@/components/layout/DashboardLayout';

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

function toLocalDatetime(iso: string | null | undefined) {
  if (!iso) return '';
  return iso.slice(0, 16);
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.id);
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // CEP state
  const [cepLoading, setCepLoading] = useState(false);

  // Image upload state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState({
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
    bannerUrl: '',
    imageUrls: [] as string[],
    maxAttendees: '',
    isPublished: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/events/${eventId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Evento não encontrado');
        const data = await res.json();
        const ev = data.event ?? data;
        const imgs: string[] = (() => {
          if (ev.imageUrls) {
            return typeof ev.imageUrls === 'string' ? JSON.parse(ev.imageUrls) : ev.imageUrls;
          }
          if (ev.bannerUrl) {
            try { const p = JSON.parse(ev.bannerUrl); if (Array.isArray(p)) return p; } catch {}
            return [ev.bannerUrl];
          }
          return [];
        })();
        setForm({
          title: ev.title ?? '',
          description: ev.description ?? '',
          category: ev.category ?? 'music',
          eventDate: toLocalDatetime(ev.eventDate),
          eventEndDate: toLocalDatetime(ev.eventEndDate),
          locationType: ev.locationType ?? 'presencial',
          venueName: ev.venueName ?? '',
          address: ev.address ?? '',
          complement: ev.complement ?? '',
          city: ev.city ?? '',
          state: ev.state ?? '',
          zipcode: ev.zipcode ?? '',
          onlineUrl: ev.onlineUrl ?? '',
          bannerUrl: ev.bannerUrl ?? '',
          imageUrls: imgs,
          maxAttendees: ev.maxAttendees != null ? String(ev.maxAttendees) : '',
          isPublished: ev.isPublished ?? false,
        });
        setImagePreviews(imgs);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar evento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId, getToken]);

  const setField = (k: string, v: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

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
    } catch { /* ignora erro de CEP */ } finally {
      setCepLoading(false);
    }
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 10 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    const isExisting = idx < form.imageUrls.length && imageFiles.length === 0;
    if (isExisting) {
      setField('imageUrls', form.imageUrls.filter((_, i) => i !== idx));
      setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    } else {
      const fileIdx = idx - (form.imageUrls.length - imageFiles.length);
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIdx));
      setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const uploadImages = async (token: string): Promise<string[]> => {
    if (imageFiles.length === 0) return form.imageUrls;
    setUploadingImages(true);
    try {
      const urls: string[] = [...form.imageUrls];
      for (const file of imageFiles) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) throw new Error('Erro ao fazer upload da imagem');
        const data = await res.json();
        urls.push(data.url);
      }
      return urls;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Título é obrigatório'); return; }
    if (!form.eventDate) { setError('Data do evento é obrigatória'); return; }

    const token = getToken();
    if (!token) { router.push('/login'); return; }

    setSaving(true);
    setError(null);
    try {
      const allUrls = await uploadImages(token);
      const bannerUrl = allUrls.length > 0 ? JSON.stringify(allUrls) : undefined;

      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : undefined,
          eventEndDate: form.eventEndDate ? new Date(form.eventEndDate).toISOString() : undefined,
          locationType: form.locationType,
          venueName: form.venueName || undefined,
          address: form.address || undefined,
          complement: form.complement || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zipcode: form.zipcode || undefined,
          onlineUrl: form.onlineUrl || undefined,
          bannerUrl,
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
          isPublished: form.isPublished,
          status: form.isPublished ? 'published' : 'draft',
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? 'Erro ao salvar');
      }

      setSaved(true);
      setTimeout(() => router.push('/organizer/dashboard'), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setSaving(false);
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

  return (
    <DashboardLayout userRole="organizer">
      <div className="bg-gray-50 min-h-screen">
        <div className="text-white py-8" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-2xl font-bold">Editar Evento</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaCalendarAlt className="text-[#00C2A8]" /> Informações do Evento
            </h2>

            <div>
              <label className="label-form">Título do evento *</label>
              <input type="text" className="input-form" placeholder="Ex: Festival de Música Eletrônica 2025"
                value={form.title} onChange={(e) => setField('title', e.target.value)} />
            </div>

            <div>
              <label className="label-form">Descrição</label>
              <textarea rows={4} className="input-form resize-none" placeholder="Descreva seu evento..."
                value={form.description} onChange={(e) => setField('description', e.target.value)} />
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
                <input type="datetime-local" className="input-form"
                  value={form.eventDate} onChange={(e) => setField('eventDate', e.target.value)} />
              </div>
              <div>
                <label className="label-form">Data de término</label>
                <input type="datetime-local" className="input-form"
                  value={form.eventEndDate} onChange={(e) => setField('eventEndDate', e.target.value)} />
              </div>
            </div>

            {form.locationType !== 'online' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#00C2A8]" /> Local
                </h3>
                <div>
                  <label className="label-form">Nome do local</label>
                  <input type="text" className="input-form" placeholder="Ex: Allianz Parque"
                    value={form.venueName} onChange={(e) => setField('venueName', e.target.value)} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label-form">CEP</label>
                    <div className="relative">
                      <input type="text" className="input-form" maxLength={9} placeholder="00000-000"
                        value={form.zipcode}
                        onChange={(e) => setField('zipcode', e.target.value)}
                        onBlur={(e) => handleCepBlur(e.target.value)} />
                      {cepLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 flex items-center gap-1">
                          <FaSearch className="animate-spin" /> buscando...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="label-form">Endereço (preenchido pelo CEP)</label>
                    <input type="text" className="input-form" placeholder="Rua, número"
                      value={form.address} onChange={(e) => setField('address', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="label-form">Complemento</label>
                  <input type="text" className="input-form" placeholder="Apto, bloco, sala, etc."
                    value={form.complement} onChange={(e) => setField('complement', e.target.value)} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="label-form">Cidade</label>
                    <input type="text" className="input-form" value={form.city}
                      onChange={(e) => setField('city', e.target.value)} />
                  </div>
                  <div>
                    <label className="label-form">UF</label>
                    <input type="text" maxLength={2} className="input-form uppercase" value={form.state}
                      onChange={(e) => setField('state', e.target.value.toUpperCase())} />
                  </div>
                </div>
              </div>
            )}

            {form.locationType !== 'presencial' && (
              <div>
                <label className="label-form">URL do evento online</label>
                <input type="url" className="input-form" placeholder="https://..."
                  value={form.onlineUrl} onChange={(e) => setField('onlineUrl', e.target.value)} />
              </div>
            )}

            <div>
              <label className="label-form">Capacidade máxima</label>
              <input type="number" min="1" className="input-form" placeholder="Ex: 500"
                value={form.maxAttendees} onChange={(e) => setField('maxAttendees', e.target.value)} />
            </div>

            {/* Upload de imagens */}
            <div>
              <label className="label-form flex items-center gap-2">
                <FaImages className="text-[#00C2A8]" /> Imagens do evento (até 10)
              </label>
              <p className="text-xs text-gray-400 mb-3">A primeira imagem será usada como capa. Arraste ou clique para adicionar.</p>

              <label className="block w-full border-2 border-dashed border-[#00C2A8]/40 rounded-xl p-6 text-center cursor-pointer hover:border-[#00C2A8] hover:bg-[#00C2A8]/5 transition-all">
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => handleImageFiles(e.target.files)} />
                <FaImages className="text-3xl text-[#00C2A8]/50 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Clique ou arraste imagens aqui</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP • Máx. 5 MB por arquivo</p>
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      {i === 0 && (
                        <span className="absolute top-1 left-1 z-10 text-[10px] font-bold bg-[#00C2A8] text-white px-1.5 py-0.5 rounded">
                          CAPA
                        </span>
                      )}
                      <img src={src} alt="" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#00C2A8]/5 rounded-xl border border-[#00C2A8]/20">
              <input type="checkbox" id="publish" checked={form.isPublished}
                onChange={(e) => setField('isPublished', e.target.checked)}
                className="w-4 h-4 accent-[#00C2A8]" />
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
                disabled={saving || uploadingImages}
                className="flex-1 py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#00C2A8' }}
              >
                <FaSave />
                {uploadingImages ? 'Enviando imagens...' : saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
