'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/utils/storage';
import { authService } from '@/lib/api/services/auth.service';
import { FaUserTie, FaBuilding, FaPhone, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function applyCnpjMask(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function applyPhoneMask(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

export default function BecomeOrganizerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: '',
    cnpj: '',
    phone: '',
    city: '',
    state: '',
    description: '',
  });

  useEffect(() => {
    const token = storage.getToken();
    const role = storage.getUserRole();
    if (!token) { router.replace('/login'); return; }
    if (role === 'organizer' || role === 'admin') {
      router.replace('/organizer/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        name === 'cnpj' ? applyCnpjMask(value) :
        name === 'phone' ? applyPhoneMask(value) :
        value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cnpjRaw = form.cnpj.replace(/\D/g, '');
    if (cnpjRaw.length !== 14) {
      setError('CNPJ inválido. Informe os 14 dígitos.');
      setLoading(false);
      return;
    }

    try {
      const token = storage.getToken();
      const res = await fetch(`${API_URL}/organizers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: form.companyName,
          cnpj: cnpjRaw,
          phone: form.phone.replace(/\D/g, ''),
          city: form.city,
          state: form.state,
          description: form.description || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao criar conta de organizador.');
      }

      authService.logout();
      router.replace('/login?message=organizer-created');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#00C2A8,#007465)' }}>
            <FaUserTie className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Virar Organizador</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Preencha os dados da sua empresa para criar eventos na plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Company name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <FaBuilding className="inline mr-1.5 text-gray-400" />
              Nome da empresa / produtora *
            </label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
              placeholder="Ex: Eventos Brasil Ltda"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/40 focus:border-turquoise"
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              CNPJ *
            </label>
            <input
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              required
              placeholder="00.000.000/0000-00"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/40 focus:border-turquoise"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <FaPhone className="inline mr-1.5 text-gray-400" />
              Telefone de contato *
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="(00) 00000-0000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/40 focus:border-turquoise"
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <FaMapMarkerAlt className="inline mr-1.5 text-gray-400" />
                Cidade *
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="São Paulo"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/40 focus:border-turquoise"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">UF *</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/40 focus:border-turquoise bg-white"
              >
                <option value="">UF</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <FaFileAlt className="inline mr-1.5 text-gray-400" />
              Sobre a empresa <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva brevemente sua empresa ou produtora de eventos..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise/40 focus:border-turquoise resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition-opacity disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#00C2A8,#007465)' }}
          >
            {loading ? 'Criando conta...' : 'Criar conta de organizador'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Após o cadastro você será redirecionado para fazer login novamente
            com seu novo perfil de organizador.
          </p>
        </form>
      </div>
    </div>
  );
}
