'use client';

import { useState } from 'react';
import { FaTimes, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaTicketAlt } from 'react-icons/fa';
import { authService } from '@/lib/api/services/auth.service';
import { storage } from '@/lib/utils/storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (role: string) => void;
  eventTitle?: string;
}

type Tab = 'login' | 'register';

export default function LoginModal({ onClose, onSuccess, eventTitle }: LoginModalProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', cpfCnpj: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError('Preencha e-mail e senha.'); return;
    }
    setLoading(true); setError(null);
    try {
      const res = await authService.login({ email: loginForm.email, password: loginForm.password });
      onSuccess(res.role ?? 'participant');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Erro ao fazer login';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      setError('Preencha todos os campos obrigatórios.'); return;
    }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          cpfCnpj: registerForm.cpfCnpj || undefined,
          role: 'participant',
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? 'Erro ao criar conta');
      }
      const loginRes = await authService.login({ email: registerForm.email, password: registerForm.password });
      onSuccess(loginRes.role ?? 'participant');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Cliente Demo', email: 'cliente@demo.com', password: 'demo123' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative text-white px-6 py-5" style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FaTicketAlt className="text-white text-lg" />
            </div>
            <div>
              <h2 className="font-black text-lg leading-tight">
                {tab === 'login' ? 'Entrar na sua conta' : 'Criar conta grátis'}
              </h2>
              {eventTitle && (
                <p className="text-white/70 text-xs mt-0.5">para comprar ingresso em "{eventTitle}"</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-white/10 rounded-xl p-1">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'login' ? 'bg-white text-[#003B4A]' : 'text-white/80 hover:text-white'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'register' ? 'bg-white text-[#003B4A]' : 'text-white/80 hover:text-white'}`}
            >
              Criar conta
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">E-mail</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/15 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Senha</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/15 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60 text-sm"
                style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}
              >
                {loading ? 'Entrando...' : 'Entrar e comprar'}
              </button>

              {/* Demo shortcut */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 text-center mb-2">Acesso rápido para testes</p>
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setLoginForm({ email: acc.email, password: acc.password })}
                    className="w-full py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:border-[#00C2A8] hover:text-[#00C2A8] transition-all"
                  >
                    {acc.label} — {acc.email}
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nome completo *</label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/15 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">E-mail *</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/15 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Senha *</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/15 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">CPF/CNPJ <span className="normal-case text-gray-400 font-normal">(opcional)</span></label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={registerForm.cpfCnpj}
                  onChange={(e) => setRegisterForm(f => ({ ...f, cpfCnpj: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/15 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60 text-sm"
                style={{ background: 'linear-gradient(135deg,#003B4A,#00C2A8)' }}
              >
                {loading ? 'Criando conta...' : 'Criar conta e comprar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
