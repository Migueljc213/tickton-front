'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FaTicketAlt, FaStar, FaCheckCircle, FaExclamationCircle,
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Star picker ──────────────────────────────────────────────────────────────

function StarPicker({
  value, onChange, label,
}: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          >
            <FaStar className={s <= (hover || value) ? 'text-amber-400' : 'text-gray-200'} />
          </button>
        ))}
        {value > 0 && (
          <span className="self-center text-sm text-gray-400 ml-1">
            {['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'][value]}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── NPS Selector ─────────────────────────────────────────────────────────────

function NpsSelector({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-1">
        Em uma escala de 0 a 10, quanto você recomendaria este evento para um amigo?
      </p>
      <p className="text-xs text-gray-400 mb-4">0 = De jeito nenhum &nbsp;·&nbsp; 10 = Com certeza!</p>
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: 11 }, (_, i) => {
          const isSelected = value === i;
          const color = i >= 9 ? '#22c55e' : i >= 7 ? '#eab308' : '#ef4444';
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className="w-10 h-10 rounded-xl font-bold text-sm transition-all hover:scale-105 focus:outline-none"
              style={{
                background: isSelected ? color : '#f3f4f6',
                color: isSelected ? '#fff' : '#6b7280',
                boxShadow: isSelected ? `0 0 12px ${color}88` : 'none',
              }}
            >
              {i}
            </button>
          );
        })}
      </div>
      {value !== null && (
        <p className="mt-3 text-sm font-semibold" style={{
          color: value >= 9 ? '#22c55e' : value >= 7 ? '#eab308' : '#ef4444',
        }}>
          {value >= 9 ? 'Que ótimo! Você é um promotor!' : value >= 7 ? 'Obrigado pelo feedback neutro.' : 'Lamentamos. Queremos melhorar!'}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [npsScore, setNpsScore]         = useState<number | null>(null);
  const [soundRating, setSoundRating]   = useState(0);
  const [bathroomRating, setBathroomRating] = useState(0);
  const [barWaitRating, setBarWaitRating]   = useState(0);
  const [securityRating, setSecurityRating] = useState(0);
  const [openComment, setOpenComment]   = useState('');
  const [ticketCode, setTicketCode]     = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const canSubmit = npsScore !== null && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (npsScore === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { npsScore };
      if (soundRating > 0)    body.soundRating    = soundRating;
      if (bathroomRating > 0) body.bathroomRating = bathroomRating;
      if (barWaitRating > 0)  body.barWaitRating  = barWaitRating;
      if (securityRating > 0) body.securityRating = securityRating;
      if (openComment.trim()) body.openComment    = openComment.trim();
      if (ticketCode.trim())  body.purchasedTicketId = Number(ticketCode.trim());

      const res = await fetch(`${API_URL}/event-feedbacks/event/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao enviar avaliação');
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Tela de sucesso ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #003B4A 0%, #00C2A8 100%)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Obrigado pelo feedback!</h2>
          <p className="text-gray-500 mb-6">
            Sua avaliação foi registrada com sucesso. Ela vai nos ajudar a melhorar cada vez mais!
          </p>
          <Link
            href="/events"
            className="inline-block px-6 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-all"
            style={{ background: '#00C2A8' }}
          >
            Explorar mais eventos
          </Link>
        </div>
      </div>
    );
  }

  // ── Formulário ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4"
      style={{ background: 'linear-gradient(135deg, #003B4A 0%, #007465 100%)' }}>

      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <FaTicketAlt className="text-white text-lg" />
          </div>
          <span className="text-2xl font-black text-white">Ticketon</span>
        </Link>
        <p className="text-white/60 text-sm mt-2">Formulário de avaliação pós-evento</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-2xl max-w-xl mx-auto overflow-hidden"
      >
        {/* Cabeçalho */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Como foi o evento?</h1>
          <p className="text-gray-500 text-sm">Sua opinião é muito importante para nós. Responde em menos de 2 minutos!</p>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* NPS */}
          <NpsSelector value={npsScore} onChange={setNpsScore} />

          {/* Avaliações de estrutura */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4">
              Avalie a infraestrutura do evento <span className="text-gray-400 font-normal text-sm">(opcional)</span>
            </h3>
            <div className="space-y-5">
              <StarPicker value={soundRating}    onChange={setSoundRating}    label="Qualidade do Som" />
              <StarPicker value={bathroomRating} onChange={setBathroomRating} label="Limpeza dos Banheiros" />
              <StarPicker value={barWaitRating}  onChange={setBarWaitRating}  label="Tempo de Fila no Bar" />
              <StarPicker value={securityRating} onChange={setSecurityRating} label="Segurança" />
            </div>
          </div>

          {/* Comentário aberto */}
          <div>
            <label className="label-form">
              Tem algo a mais que queira compartilhar? <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              className="input-form resize-none"
              rows={4}
              maxLength={1000}
              placeholder="Conta pra gente o que você achou, o que poderia melhorar ou o que foi incrível..."
              value={openComment}
              onChange={e => setOpenComment(e.target.value)}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{openComment.length}/1000</p>
          </div>

          {/* Código do ingresso (opcional) */}
          <div>
            <label className="label-form">
              Código do seu ingresso <span className="text-gray-400 font-normal">(opcional — evita envio duplicado)</span>
            </label>
            <input
              type="text"
              className="input-form"
              placeholder="Ex: 1234"
              value={ticketCode}
              onChange={e => setTicketCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <FaExclamationCircle className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: canSubmit ? 'linear-gradient(135deg, #003B4A, #00C2A8)' : '#9ca3af' }}
          >
            {submitting ? 'Enviando...' : 'Enviar minha avaliação'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Sua resposta é anônima e nos ajuda a melhorar futuros eventos.
          </p>
        </div>
      </form>
    </div>
  );
}
