'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FaSearch, FaMapMarkerAlt, FaGlobe, FaCheckDouble,
  FaTicketAlt, FaTimes,
} from 'react-icons/fa';
import { organizersService } from '@/lib/api/services/organizers.service';
import type { Organizer } from '@/types/api';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
    <div className="flex items-center gap-4">
      <div className="skeleton w-16 h-16 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    </div>
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-2/3 rounded" />
  </div>
);

function OrganizerCard({ org }: { org: Organizer }) {
  const initial = org.companyName.charAt(0).toUpperCase();
  return (
    <Link
      href={`/organizers/${org.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Faixa de topo */}
      <div
        className="h-2 w-full"
        style={{ background: 'linear-gradient(90deg,#003B4A,#00C2A8)' }}
      />

      <div className="p-6 flex flex-col flex-1">
        {/* Avatar + nome */}
        <div className="flex items-start gap-4 mb-4">
          {org.logoUrl ? (
            <img
              src={org.logoUrl}
              alt={org.companyName}
              className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}
            >
              {initial}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="font-black text-gray-900 text-base leading-tight group-hover:text-turquoise transition-colors line-clamp-1">
                {org.companyName}
              </h2>
              {org.isVerified && (
                <span className="flex items-center gap-1 text-turquoise text-[10px] font-bold bg-turquoise/10 px-2 py-0.5 rounded-full flex-shrink-0">
                  <FaCheckDouble className="text-[8px]" /> Verificado
                </span>
              )}
            </div>

            {(org.city || org.state) && (
              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                <FaMapMarkerAlt className="text-turquoise text-[10px] flex-shrink-0" />
                {[org.city, org.state].filter(Boolean).join(' - ')}
              </p>
            )}
          </div>
        </div>

        {/* Descrição */}
        {org.description ? (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
            {org.description}
          </p>
        ) : (
          <div className="flex-1 mb-4" />
        )}

        {/* Rodapé */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <FaTicketAlt className="text-turquoise text-[10px]" />
            Ver eventos
          </span>
          {org.website && (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-turquoise hover:underline"
            >
              <FaGlobe className="text-[10px]" /> Site
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [filterState, setFilterState] = useState('');

  useEffect(() => {
    organizersService.getAllOrganizers()
      .then((res) => setOrganizers(res.organizers ?? []))
      .catch(() => setError('Não foi possível carregar os organizadores.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = organizers.filter((o) => o.isActive);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.companyName.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q) ||
          o.city?.toLowerCase().includes(q),
      );
    }
    if (filterState.trim()) {
      const s = filterState.trim().toUpperCase();
      list = list.filter((o) => o.state?.toUpperCase() === s);
    }
    // Verificados primeiro
    return list.sort((a, b) => Number(b.isVerified) - Number(a.isVerified));
  }, [organizers, search, filterState]);

  const hasFilter = search || filterState;

  const states = useMemo(() => {
    const set = new Set(organizers.filter((o) => o.isActive && o.state).map((o) => o.state!));
    return Array.from(set).sort();
  }, [organizers]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-dark-blue to-[#005166] py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <span className="section-label text-turquoise">Descobrir</span>
          <h1 className="text-4xl font-black text-white mt-2 mb-3">Organizadores</h1>
          <p className="text-white/65 text-lg max-w-xl">
            Conheça quem está por trás dos melhores eventos. Siga seus organizadores favoritos e fique por dentro de tudo.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* Barra de busca */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 -mt-6 relative z-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar organizadores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/12 outline-none text-sm text-gray-700 bg-white min-w-[140px]"
            >
              <option value="">Todos os estados</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {hasFilter && (
              <button
                onClick={() => { setSearch(''); setFilterState(''); }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-red-500 hover:border-red-200 transition-all whitespace-nowrap"
              >
                <FaTimes className="text-xs" /> Limpar
              </button>
            )}
          </div>
        </div>

        {/* Contagem */}
        {!loading && (
          <p className="text-sm text-gray-400 mb-5">
            {filtered.length} organizador{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum organizador encontrado</h3>
            <p className="text-gray-500 text-sm">Tente buscar com outros termos.</p>
            {hasFilter && (
              <button
                onClick={() => { setSearch(''); setFilterState(''); }}
                className="mt-5 px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: '#00C2A8' }}
              >
                Ver todos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
            {filtered.map((org) => (
              <OrganizerCard key={org.id} org={org} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
