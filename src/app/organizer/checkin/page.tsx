'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaQrcode,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSearch,
  FaCamera,
  FaStopCircle,
  FaUser,
  FaCalendarAlt,
  FaTicketAlt,
  FaIdCard,
} from 'react-icons/fa';
import { useAuth } from '@/hooks';
import DashboardLayout from '@/components/layout/DashboardLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TicketInfo {
  id: number;
  qrCode: string;
  status: string;
  usedAt: string | null;
  buyer: { id: number; name: string; email: string; cpfCnpj: string | null };
  ticket: { id: number; name: string; price: number; ticketType: string };
  event: { id: number; title: string; eventDate: string; venueName: string | null; city: string | null };
}

type ScanStatus = 'success' | 'already_used' | 'error';

interface ScanResult {
  status: ScanStatus;
  message: string;
  info?: TicketInfo;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TicketCard({ info, status }: { info: TicketInfo; status: ScanStatus }) {
  const borderColor = status === 'success' ? '#22c55e' : status === 'already_used' ? '#eab308' : '#ef4444';
  const bgColor     = status === 'success' ? '#f0fdf4' : status === 'already_used' ? '#fefce8' : '#fef2f2';

  return (
    <div style={{ border: `2px solid ${borderColor}`, borderRadius: 16, background: bgColor, padding: 20, marginTop: 16 }}>
      {/* Cabeçalho do evento */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <FaCalendarAlt style={{ color: '#003B4A', flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#003B4A', margin: 0 }}>{info.event.title}</p>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
            {formatDateTime(info.event.eventDate)}
            {info.event.venueName && ` · ${info.event.venueName}`}
            {info.event.city && `, ${info.event.city}`}
          </p>
        </div>
      </div>

      {/* Dados do comprador */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <FaUser style={{ fontSize: '0.7rem', color: '#64748b' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comprador</span>
          </div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', margin: 0 }}>{info.buyer.name}</p>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0', wordBreak: 'break-all' }}>{info.buyer.email}</p>
          {info.buyer.cpfCnpj && (
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>{info.buyer.cpfCnpj}</p>
          )}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <FaTicketAlt style={{ fontSize: '0.7rem', color: '#64748b' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingresso</span>
          </div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', margin: 0 }}>{info.ticket.name}</p>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
            {info.ticket.ticketType === 'free' ? 'Gratuito' : formatPrice(info.ticket.price)}
          </p>
          {info.usedAt && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '4px 0 0' }}>
              Usado em: {formatDateTime(info.usedAt)}
            </p>
          )}
        </div>
      </div>

      {/* QR code UUID */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '6px 10px', background: 'rgba(0,0,0,0.04)', borderRadius: 8 }}>
        <FaIdCard style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }} />
        <p style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#94a3b8', margin: 0, wordBreak: 'break-all' }}>
          {info.qrCode}
        </p>
      </div>
    </div>
  );
}

const RESULT_CONFIG: Record<ScanStatus, { icon: React.ReactNode; text: string; color: string }> = {
  success:    { icon: <FaCheckCircle />,          text: '#16a34a', color: '#22c55e' },
  already_used: { icon: <FaExclamationTriangle />, text: '#a16207', color: '#eab308' },
  error:      { icon: <FaTimesCircle />,           text: '#dc2626', color: '#ef4444' },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckinPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<Array<{ code: string; result: ScanResult; time: string }>>([]);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<import('@zxing/browser').IScannerControls | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) router.push('/login');
  }, [getToken, router]);

  const validate = useCallback(async (qrCode: string) => {
    const token = getToken();
    if (!token || !qrCode.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `${API_URL}/purchased-tickets/validate/${encodeURIComponent(qrCode.trim())}`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } },
      );

      const data = await res.json().catch(() => ({}));
      let scanResult: ScanResult;

      if (res.ok) {
        scanResult = {
          status: 'success',
          message: 'Ingresso válido! Entrada liberada.',
          info: data as TicketInfo,
        };
      } else if (res.status === 400) {
        const msg: string = typeof data.message === 'string' ? data.message : 'Erro ao validar';
        if (msg.includes('já utilizado')) {
          scanResult = {
            status: 'already_used',
            message: 'Ingresso já foi utilizado.',
            info: data.ticket as TicketInfo | undefined,
          };
        } else if (msg.includes('cancelado')) {
          scanResult = { status: 'error', message: 'Ingresso cancelado.' };
        } else if (msg.includes('inválido')) {
          scanResult = { status: 'error', message: 'QR code inválido — ingresso não encontrado.' };
        } else {
          scanResult = { status: 'error', message: msg };
        }
      } else {
        scanResult = { status: 'error', message: 'Erro ao comunicar com o servidor.' };
      }

      setResult(scanResult);
      setHistory((prev) => [
        { code: qrCode.trim(), result: scanResult, time: new Date().toLocaleTimeString('pt-BR') },
        ...prev.slice(0, 19),
      ]);
      setManualCode('');
    } catch {
      setResult({ status: 'error', message: 'Erro de conexão. Verifique a internet.' });
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validate(manualCode);
  };

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraMode(false);
    setCameraError(null);
  }, []);

  // Inicia o ZXing DEPOIS que o <video> já está no DOM (useEffect roda após o commit do React)
  useEffect(() => {
    if (!cameraMode) return;

    let active = true;

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();

        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current!,
          (result, err) => {
            if (!active || !result) return void err;
            void validate(result.getText());
          },
        );

        if (!active) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      } catch (err) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : '';
        const denied = msg.includes('Permission') || msg.includes('NotAllowed') || msg.includes('NotFound');
        setCameraError(
          denied
            ? 'Permissão de câmera negada. Permita o acesso nas configurações do navegador.'
            : 'Não foi possível acessar a câmera. Use o modo manual.',
        );
        setCameraMode(false);
      }
    })();

    return () => {
      active = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [cameraMode, validate]);

  const startCamera = () => {
    setCameraError(null);
    setCameraMode(true);
  };

  const sessionStats = {
    validated: history.filter((h) => h.result.status === 'success').length,
    alreadyUsed: history.filter((h) => h.result.status === 'already_used').length,
    invalid: history.filter((h) => h.result.status === 'error').length,
  };

  return (
    <DashboardLayout userRole="organizer">
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="text-white py-8" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaQrcode className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Controle de Portaria</h1>
                <p className="text-white/70 text-sm">Escaneie ou digite o QR code do ingresso</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Validados', value: sessionStats.validated, color: '#4ade80' },
                { label: 'Já usados', value: sessionStats.alreadyUsed, color: '#fbbf24' },
                { label: 'Inválidos', value: sessionStats.invalid, color: '#f87171' },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-2xl py-6 space-y-5">

          {/* Camera or Manual Input */}
          {cameraMode ? (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative bg-black aspect-video">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                {/* Viewfinder overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-56 h-56">
                    {/* Corner brackets */}
                    {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos) => (
                      <div
                        key={pos}
                        className={`absolute ${pos} w-8 h-8`}
                        style={{
                          borderTop: '3px solid #00C2A8',
                          borderLeft: '3px solid #00C2A8',
                          borderRadius: '2px 0 0 0',
                        }}
                      />
                    ))}
                    {/* Scan line */}
                    <div
                      className="absolute left-2 right-2 h-0.5 animate-bounce"
                      style={{ background: '#00C2A8', top: '50%', opacity: 0.8 }}
                    />
                  </div>
                </div>
                <p className="absolute bottom-3 left-0 right-0 text-center text-white text-xs bg-black/50 py-1.5">
                  Aponte a câmera para o QR code do ingresso
                </p>
              </div>
              <div className="p-4">
                <button
                  onClick={stopCamera}
                  className="w-full py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                >
                  <FaStopCircle className="text-red-400" /> Fechar câmera
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-[#00C2A8]" /> Validar Ingresso
              </h2>

              {cameraError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">
                  {cameraError}
                </p>
              )}

              <form onSubmit={handleManualSubmit} className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Cole o UUID do QR code aqui"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A8] text-sm font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !manualCode.trim()}
                  className="px-5 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ backgroundColor: '#00C2A8' }}
                >
                  {loading ? '...' : 'Validar'}
                </button>
              </form>

              <button
                onClick={startCamera}
                className="mt-3 w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 flex items-center justify-center gap-2 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors"
              >
                <FaCamera /> Usar câmera (leitura automática)
              </button>
            </div>
          )}

          {/* Scan Result */}
          {result && (() => {
            const cfg = RESULT_CONFIG[result.status];
            return (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ color: cfg.color, fontSize: '1.5rem' }}>{cfg.icon}</span>
                  <p className="text-lg font-bold" style={{ color: cfg.text }}>{result.message}</p>
                </div>

                {result.info && <TicketCard info={result.info} status={result.status} />}

                <button
                  onClick={() => { setResult(null); inputRef.current?.focus(); }}
                  className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
                >
                  Validar outro ingresso
                </button>
              </div>
            );
          })()}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">
                Histórico desta sessão ({history.length})
              </h2>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {history.map((h, i) => {
                  const cfg = RESULT_CONFIG[h.result.status];
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <span style={{ color: cfg.color, flexShrink: 0 }}>{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        {h.result.info ? (
                          <>
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {h.result.info.buyer.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {h.result.info.ticket.name} · {h.result.info.event.title}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-mono text-gray-600 truncate">{h.code}</p>
                            <p className="text-xs text-gray-400">{h.result.message}</p>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{h.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
