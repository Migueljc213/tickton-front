'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaQrcode,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSearch,
  FaCamera,
} from 'react-icons/fa';
import { useAuth } from '@/hooks';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type ScanResult = {
  status: 'success' | 'error' | 'warning';
  message: string;
  ticket?: {
    id: number;
    qrCode: string;
    status: string;
    usedAt: string | null;
  };
};

export default function CheckinPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<Array<{ code: string; result: ScanResult; time: string }>>([]);
  const [cameraMode, setCameraMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) router.push('/login');
  }, [getToken, router]);

  const validate = async (qrCode: string) => {
    const token = getToken();
    if (!token || !qrCode.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/purchased-tickets/validate/${encodeURIComponent(qrCode.trim())}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      let scanResult: ScanResult;

      if (res.ok) {
        scanResult = {
          status: 'success',
          message: 'Ingresso validado com sucesso!',
          ticket: data,
        };
      } else if (res.status === 400) {
        const msg: string = data.message ?? '';
        if (msg.includes('já utilizado')) {
          scanResult = { status: 'warning', message: 'Ingresso já foi utilizado anteriormente.', ticket: data };
        } else if (msg.includes('cancelado')) {
          scanResult = { status: 'error', message: 'Ingresso cancelado.', ticket: data };
        } else if (msg.includes('inválido')) {
          scanResult = { status: 'error', message: 'QR code inválido. Ingresso não encontrado.' };
        } else {
          scanResult = { status: 'error', message: msg || 'Erro ao validar ingresso.' };
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
      const scanResult: ScanResult = { status: 'error', message: 'Erro de conexão. Verifique a internet.' };
      setResult(scanResult);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validate(manualCode);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraMode(true);
    } catch {
      alert('Não foi possível acessar a câmera. Use o modo manual.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraMode(false);
  };

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const RESULT_CONFIG = {
    success: {
      icon: <FaCheckCircle className="text-5xl text-green-500" />,
      bg: 'bg-green-50 border-green-200',
      title: 'text-green-700',
    },
    warning: {
      icon: <FaExclamationTriangle className="text-5xl text-yellow-500" />,
      bg: 'bg-yellow-50 border-yellow-200',
      title: 'text-yellow-700',
    },
    error: {
      icon: <FaTimesCircle className="text-5xl text-red-500" />,
      bg: 'bg-red-50 border-red-200',
      title: 'text-red-700',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-8" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-2xl">
          <button onClick={() => { stopCamera(); router.back(); }}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm">
            <FaArrowLeft /> Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FaQrcode className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Controle de Portaria</h1>
              <p className="text-white/70 text-sm">Valide QR codes dos ingressos</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Validados hoje', value: history.filter((h) => h.result.status === 'success').length },
              { label: 'Já utilizados', value: history.filter((h) => h.result.status === 'warning').length },
              { label: 'Inválidos', value: history.filter((h) => h.result.status === 'error').length },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl py-6 space-y-5">

        {/* Camera or manual input */}
        {cameraMode ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="relative bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 border-4 border-[#00C2A8] rounded-2xl opacity-80" />
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-1">
                Aponte para o QR code do ingresso
              </p>
            </div>
            <div className="p-4 flex gap-3">
              <button onClick={stopCamera}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-gray-400">
                Fechar câmera
              </button>
              <p className="flex-1 text-xs text-gray-400 flex items-center justify-center text-center">
                Detecção automática em breve. Use o modo manual por enquanto.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaSearch className="text-[#00C2A8]" /> Validar Ingresso
            </h2>
            <form onSubmit={handleManualSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Cole ou digite o código UUID do QR code"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A8] text-sm font-mono"
                autoFocus
              />
              <button type="submit" disabled={loading || !manualCode.trim()}
                className="px-5 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-all hover:opacity-90"
                style={{ backgroundColor: '#00C2A8' }}>
                {loading ? '...' : 'Validar'}
              </button>
            </form>
            <button onClick={startCamera}
              className="mt-3 w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 flex items-center justify-center gap-2 hover:border-[#00C2A8] hover:text-[#00C2A8] transition-colors">
              <FaCamera /> Usar câmera
            </button>
          </div>
        )}

        {/* Result */}
        {result && (() => {
          const cfg = RESULT_CONFIG[result.status];
          return (
            <div className={`rounded-2xl border-2 p-6 text-center space-y-3 ${cfg.bg}`}>
              {cfg.icon}
              <p className={`text-lg font-bold ${cfg.title}`}>{result.message}</p>
              {result.ticket && (
                <p className="text-xs text-gray-500 font-mono">{result.ticket.qrCode}</p>
              )}
              <button onClick={() => { setResult(null); inputRef.current?.focus(); }}
                className="text-sm text-gray-500 underline">
                Validar outro
              </button>
            </div>
          );
        })()}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Histórico desta sessão</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  {h.result.status === 'success' ? (
                    <FaCheckCircle className="text-green-500 shrink-0" />
                  ) : h.result.status === 'warning' ? (
                    <FaExclamationTriangle className="text-yellow-500 shrink-0" />
                  ) : (
                    <FaTimesCircle className="text-red-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-600 truncate">{h.code}</p>
                    <p className="text-xs text-gray-400">{h.result.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
