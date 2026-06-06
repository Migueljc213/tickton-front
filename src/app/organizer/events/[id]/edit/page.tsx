'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaSave, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '@/hooks';

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

  const [form, setForm] = useState({
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
        setForm({
          title: ev.title ?? '',
          description: ev.description ?? '',
          category: ev.category ?? 'music',
          eventDate: toLocalDatetime(ev.eventDate),
          eventEndDate: toLocalDatetime(ev.eventEndDate),
          locationType: ev.locationType ?? 'presencial',
          venueName: ev.venueName ?? '',
          address: ev.address ?? '',
          city: ev.city ?? '',
          state: ev.state ?? '',
          zipcode: ev.zipcode ?? '',
          onlineUrl: ev.onlineUrl ?? '',
          bannerUrl: ev.bannerUrl ?? '',
          maxAttendees: ev.maxAttendees != null ? String(ev.maxAttendees) : '',
          isPublished: ev.isPublished ?? false,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar evento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId, getToken]);

  const setField = (k: string, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Título é obrigatório'); return; }
    if (!form.eventDate) { setError('Data do evento é obrigatória'); return; }

    const token = getToken();
    if (!token) { router.push('/login'); return; }

    setSaving(true);
    setError(null);
    try {
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
          city: form.city || undefined,
          state: form.state || undefined,
          zipcode: form.zipcode || undefined,
          onlineUrl: form.onlineUrl || undefined,
          bannerUrl: form.bannerUrl || undefined,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando evento...</p>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Evento atualizado!</h2>
          <p className="text-gray-500 text-sm">Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-white py-8" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <button
            onClick={() => router.push('/organizer/dashboard')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors"
          >
            <FaArrowLeft /> Voltar ao Dashboard
          </button>
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
              <div>
                <label className="label-form">Endereço</label>
                <input type="text" className="input-form" placeholder="Rua, número"
                  value={form.address} onChange={(e) => setField('address', e.target.value)} />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-form">Capacidade máxima</label>
              <input type="number" min="1" className="input-form" placeholder="Ex: 500"
                value={form.maxAttendees} onChange={(e) => setField('maxAttendees', e.target.value)} />
            </div>
            <div>
              <label className="label-form">URL do banner</label>
              <input type="url" className="input-form" placeholder="https://..."
                value={form.bannerUrl} onChange={(e) => setField('bannerUrl', e.target.value)} />
            </div>
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
              disabled={saving}
              className="flex-1 py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#00C2A8' }}
            >
              <FaSave />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .label-form { display: block; font-size: 0.8125rem; font-weight: 600; color: #374151; margin-bottom: 0.375rem; }
        .input-form { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #E5E7EB; border-radius: 0.75rem; font-size: 0.875rem; outline: none; transition: all 0.15s; background: white; }
        .input-form:focus { border-color: #00C2A8; box-shadow: 0 0 0 3px rgba(0,194,168,0.1); }
      `}</style>
    </div>
  );
}
