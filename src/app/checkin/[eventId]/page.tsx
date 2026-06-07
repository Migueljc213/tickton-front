'use client';

import { useState, useRef, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaQrcode,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCamera,
  FaStopCircle,
  FaUser,
  FaCalendarAlt,
  FaTicketAlt,
  FaIdCard,
  FaKeyboard,
  FaArrowLeft,
  FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '@/hooks';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Result card ──────────────────────────────────────────────────────────────

function TicketCard({ info, status }: { info: TicketInfo; status: ScanStatus }) {
  const borderColor = status === 'success' ? '#22c55e' : status === 'already_used' ? '#eab308' : '#ef4444';
  const bgColor     = status === 'success' ? '#f0fdf4' : status === 'already_used' ? '#fefce8' : '#fef2f2';

  return (
    <div style={{ border: `2px solid ${borderColor}`, borderRadius: 16, background: bgColor, padding: 16, marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <FaCalendarAlt style={{ color: '#003B4A', flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#003B4A', margin: 0 }}>{info.event.title}</p>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0' }}>
            {formatDateTime(info.event.eventDate)}
            {info.event.venueName && ` · ${info.event.venueName}`}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
            <FaUser style={{ fontSize: '0.65rem', color: '#64748b' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Comprador</span>
          </div>
          <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', margin: 0 }}>{info.buyer.name}</p>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0', wordBreak: 'break-all' }}>{info.buyer.email}</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
            <FaTicketAlt style={{ fontSize: '0.65rem', color: '#64748b' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ingresso</span>
          </div>
          <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', margin: 0 }}>{info.ticket.name}</p>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0' }}>
            {info.ticket.ticketType === 'free' ? 'Gratuito' : formatPrice(info.ticket.price)}
          </p>
          {info.usedAt && (
            <p style={{ fontSize: '0.72rem', color: '#ef4444', margin: '4px 0 0' }}>
              Usado: {formatDateTime(info.usedAt)}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, padding: '5px 8px', background: 'rgba(0,0,0,0.04)', borderRadius: 7 }}>
        <FaIdCard style={{ fontSize: '0.65rem', color: '#94a3b8', flexShrink: 0 }} />
        <p style={{ fontSize: '0.67rem', fontFamily: 'monospace', color: '#94a3b8', margin: 0, wordBreak: 'break-all' }}>
          {info.qrCode}
        </p>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<ScanStatus, { icon: React.ReactNode; color: string; text: string }> = {
  success:      { icon: <FaCheckCircle />,          color: '#22c55e', text: '#15803d' },
  already_used: { icon: <FaExclamationTriangle />,  color: '#eab308', text: '#a16207' },
  error:        { icon: <FaTimesCircle />,           color: '#ef4444', text: '#b91c1c' },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StaffCheckinPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const { getToken } = useAuth();

  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<Array<{ code: string; result: ScanResult; time: string }>>([]);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [eventTitle, setEventTitle] = useState('');

  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const token = getToken();

  useEffect(() => {
    if (!token) { router.push('/login'); return; }

    // Fetch event title for display
    fetch(`${API_URL}/events/${eventId}`)
      .then((r) => r.json())
      .then((d) => setEventTitle(d.title ?? ''))
      .catch(() => {});
  }, [token, eventId, router]);

  // Stop camera on unmount
  useEffect(() => () => { stopCamera(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = useCallback(async (qrCode: string) => {
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
        scanResult = { status: 'success', message: 'Ingresso válido! Entrada liberada.', info: data as TicketInfo };
      } else if (res.status === 400) {
        const msg: string = typeof data.message === 'string' ? data.message : '';
        if (msg.includes('já utilizado')) {
          scanResult = { status: 'already_used', message: 'Ingresso já foi utilizado.', info: data.ticket as TicketInfo };
        } else if (msg.includes('cancelado')) {
          scanResult = { status: 'error', message: 'Ingresso cancelado.' };
        } else if (msg.includes('inválido')) {
          scanResult = { status: 'error', message: 'QR code inválido.' };
        } else if (msg.includes('permissão') || msg.includes('colaborador')) {
          scanResult = { status: 'error', message: 'Sem permissão para este evento. Verifique com o organizador.' };
        } else {
          scanResult = { status: 'error', message: msg || 'Erro ao validar.' };
        }
      } else {
        scanResult = { status: 'error', message: 'Erro no servidor.' };
      }

      setResult(scanResult);
      setHistory((prev) => [
        { code: qrCode.trim(), result: scanResult, time: new Date().toLocaleTimeString('pt-BR') },
        ...prev.slice(0, 49),
      ]);
      setManualCode('');
    } catch {
      setResult({ status: 'error', message: 'Erro de conexão.' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraMode(false);
    setCameraError(null);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraMode(true);
      setShowManual(false);

      reader.decodeFromStream(stream, videoRef.current!, (res, err) => {
        if (res) {
          const code = res.getText();
          if (code && !loading) void validate(code);
        }
        void err;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setCameraError(
        msg.includes('Permission') || msg.includes('NotAllowed')
          ? 'Permissão de câmera negada.'
          : 'Câmera indisponível.',
      );
      stopCamera();
    }
  };

  const stats = {
    ok: history.filter((h) => h.result.status === 'success').length,
    dup: history.filter((h) => h.result.status === 'already_used').length,
    err: history.filter((h) => h.result.status === 'error').length,
  };

  const lastResult = result ? STATUS_CONFIG[result.status] : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #003B4A, #00C2A8)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
        >
          <FaArrowLeft />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaShieldAlt style={{ fontSize: '0.8rem', opacity: 0.8 }} />
            <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>Portaria</span>
          </div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
            {eventTitle || `Evento #${eventId}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { v: stats.ok,  color: '#4ade80', label: '✓' },
            { v: stats.dup, color: '#fbbf24', label: '!' },
            { v: stats.err, color: '#f87171', label: '✗' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: s.color }}>{s.v}</p>
              <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.7 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Camera viewport */}
      {cameraMode ? (
        <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3' }}>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />

          {/* Viewfinder */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              {['top:0;left:0', 'top:0;right:0', 'bottom:0;right:0', 'bottom:0;left:0'].map((pos, i) => {
                const [tb, lr] = pos.split(';');
                const [tbk, tbv] = tb.split(':');
                const [lrk, lrv] = lr.split(':');
                const rotations = [0, 90, 180, 270];
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      [tbk]: tbv,
                      [lrk]: lrv,
                      width: 32,
                      height: 32,
                      borderTop: '3px solid #00C2A8',
                      borderLeft: '3px solid #00C2A8',
                      borderRadius: '2px 0 0 0',
                      transform: `rotate(${rotations[i]}deg)`,
                    }}
                  />
                );
              })}
              {/* Scan line */}
              <div
                style={{
                  position: 'absolute',
                  left: 8,
                  right: 8,
                  height: 2,
                  background: '#00C2A8',
                  top: '50%',
                  opacity: 0.9,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          <p style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
            Aponte para o QR code do ingresso
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
          {/* Big QR icon when idle */}
          {!result && (
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <FaQrcode style={{ fontSize: '5rem', color: '#334155', marginBottom: 12 }} />
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Use a câmera para escanear o ingresso
              </p>
            </div>
          )}

          {/* Scan result */}
          {result && lastResult && (
            <div
              style={{
                width: '100%',
                background: '#1e293b',
                borderRadius: 16,
                padding: 20,
                border: `2px solid ${lastResult.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.6rem', color: lastResult.color }}>{lastResult.icon}</span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: lastResult.color }}>
                  {result.message}
                </p>
              </div>
              {result.info && (
                <div style={{ color: '#0f172a' }}>
                  <TicketCard info={result.info} status={result.status} />
                </div>
              )}
              <button
                onClick={() => setResult(null)}
                style={{
                  marginTop: 14,
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  width: '100%',
                }}
              >
                Validar próximo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom action bar */}
      <div
        style={{
          background: '#1e293b',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          borderTop: '1px solid #334155',
        }}
      >
        {cameraError && (
          <p style={{ margin: 0, color: '#f87171', fontSize: '0.8rem', textAlign: 'center' }}>{cameraError}</p>
        )}

        {/* Manual input (collapsible) */}
        {showManual && !cameraMode && (
          <form
            onSubmit={(e) => { e.preventDefault(); validate(manualCode); }}
            style={{ display: 'flex', gap: 8 }}
          >
            <input
              ref={inputRef}
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Cole o UUID do QR code"
              style={{
                flex: 1,
                padding: '10px 14px',
                background: '#0f172a',
                border: '1.5px solid #334155',
                borderRadius: 10,
                color: '#f8fafc',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !manualCode.trim()}
              style={{
                background: '#00C2A8',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 16px',
                fontWeight: 700,
                cursor: loading || !manualCode.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !manualCode.trim() ? 0.5 : 1,
              }}
            >
              {loading ? '...' : 'OK'}
            </button>
          </form>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {cameraMode ? (
            <button
              onClick={stopCamera}
              style={{
                flex: 1,
                padding: '14px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <FaStopCircle /> Parar câmera
            </button>
          ) : (
            <>
              <button
                onClick={startCamera}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #003B4A, #00C2A8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <FaCamera style={{ fontSize: '1.1rem' }} />
                Escanear QR Code
              </button>
              <button
                onClick={() => { setShowManual((v) => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: showManual ? '#334155' : '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <FaKeyboard /> Manual
              </button>
            </>
          )}
        </div>

        {/* Mini history */}
        {history.length > 0 && (
          <div style={{ maxHeight: 130, overflowY: 'auto' }}>
            {history.slice(0, 5).map((h, i) => {
              const cfg = STATUS_CONFIG[h.result.status];
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid #1e293b',
                  }}
                >
                  <span style={{ color: cfg.color, flexShrink: 0, fontSize: '0.85rem' }}>{cfg.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {h.result.info ? (
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.result.info.buyer.name}
                      </p>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.code}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#475569', flexShrink: 0 }}>{h.time}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
