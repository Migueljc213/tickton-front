'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { authService } from '@/lib/api/services/auth.service';
import { maskCpfCnpj } from '@/lib/utils/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'cpfCnpj' ? maskCpfCnpj(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          cpfCnpj: form.cpfCnpj.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao criar conta. Tente novamente.');
      }

      // Login automático após registro
      await authService.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setSuccess(true);
      setTimeout(() => router.push('/events'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm bg-white rounded-2xl shadow-sm p-10 space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Conta criada!</h2>
          <p className="text-gray-500 text-sm">Entrando automaticamente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-center items-center w-5/12 p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #003B4A 0%, #00C2A8 100%)' }}
      >
        <Image
            src="/logo-ticketon.png"
            alt="Ticketon"
            width={200}
            height={56}
            className="h-16 w-auto object-contain mb-6"
          />
        <h1 className="text-4xl font-black mb-4 text-center">Crie sua conta</h1>
        <p className="text-white/80 text-center text-lg leading-relaxed">
          Junte-se a milhares de pessoas que descobrem e curtem eventos com o Ticketon.
        </p>
        <div className="mt-10 space-y-3 w-full max-w-xs">
          {['Compre ingressos com segurança', 'Acesse seus QR codes', 'Gerencie seus eventos'].map((f) => (
            <div key={f} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <FaCheckCircle className="text-white/80 shrink-0" />
              <span className="text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Criar conta</h2>
            <p className="text-gray-500">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-semibold" style={{ color: '#00C2A8' }}>
                Entrar
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nome completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A8] text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-mail <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A8] text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                CPF / CNPJ
              </label>
              <input
                type="text"
                name="cpfCnpj"
                value={form.cpfCnpj}
                onChange={handleChange}
                placeholder="000.000.000-00"
                maxLength={18}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A8] text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A8] text-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirmar senha <span className="text-red-400">*</span>
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repita a senha"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C2A8] text-sm transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white font-bold rounded-xl text-base transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: '#00C2A8' }}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Ao criar uma conta, você concorda com os{' '}
            <span className="underline cursor-pointer">Termos de Uso</span> e a{' '}
            <span className="underline cursor-pointer">Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
