'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaEnvelope, FaLock, FaTicketAlt, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '@/hooks';
import { isEmailValid, isFieldEmpty } from '@/lib/utils/validation';

const LOGIN_REDIRECT = '/events';
const REGISTER_PATH  = '/register';

/* Credenciais de demonstração para acesso rápido */
const DEMO_ACCOUNTS = [
  {
    role:     'Cliente',
    desc:     'Comprar ingressos',
    icon:     '👤',
    email:    'cliente@demo.com',
    password: 'demo123',
    color:    '#3B82F6',
    bg:       '#EFF6FF',
    border:   '#BFDBFE',
    redirect: '/tickets',
  },
  {
    role:     'Administrador',
    desc:     'Painel administrativo',
    icon:     '🔧',
    email:    'admin@ticketon.com.br',
    password: 'admin123',
    color:    '#EF4444',
    bg:       '#FEF2F2',
    border:   '#FECACA',
    redirect: '/admin/dashboard',
  },
  {
    role:     'Organizador',
    desc:     'Criar e gerenciar eventos',
    icon:     '🎪',
    email:    'organizador@demo.com',
    password: 'demo123',
    color:    '#00C2A8',
    bg:       '#F0FDFA',
    border:   '#99E7DB',
    redirect: '/organizer/dashboard',
  },
] as const;

const FEATURES = [
  { icon: '🎫', title: 'Ingressos digitais',   desc: 'QR Code único e seguro no seu celular' },
  { icon: '📊', title: 'Dashboard completo',    desc: 'Métricas e relatórios em tempo real' },
  { icon: '🚀', title: 'Check-in rápido',       desc: 'Entrada ágil com app gratuito' },
  { icon: '💳', title: 'Pagamento seguro',      desc: 'PIX e cartão com proteção total' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError]     = useState<string | null>(null);
  const [demoLoading, setDemoLoading]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (isFieldEmpty(email) || isFieldEmpty(password)) {
      setLocalError('Por favor, preencha todos os campos');
      return;
    }

    if (!isEmailValid(email)) {
      setLocalError('Por favor, insira um e-mail válido');
      return;
    }

    try {
      await login({ email, password });
      router.push(LOGIN_REDIRECT);
    } catch {
      setLocalError('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[number]) => {
    setDemoLoading(account.role);
    setLocalError(null);
    setEmail(account.email);
    setPassword(account.password);
    try {
      await login({ email: account.email, password: account.password });
      router.push(account.redirect);
    } catch {
      /* Em dev sem backend, apenas preenche o formulário */
    } finally {
      setDemoLoading(null);
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex">

      {/* ========================= LADO ESQUERDO (visual) ========================= */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden flex-col justify-between p-12">
        {/* Orbs decorativos */}
        <div className="absolute top-16 left-12 w-80 h-80 bg-turquoise/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-16 right-8 w-64 h-64 bg-light-green/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-turquoise rounded-xl flex items-center justify-center shadow-lg shadow-turquoise/30">
            <FaTicketAlt className="text-white text-base" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Ticketon</span>
        </Link>

        {/* Conteúdo central */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-black text-white leading-tight mb-5">
            Bem-vindo
            <span className="block gradient-text">de volta!</span>
          </h2>
          <p className="text-white/65 text-lg leading-relaxed mb-10">
            Continue de onde parou. Seus eventos, ingressos e métricas estão esperando por você.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 glass rounded-2xl px-5 py-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-white/50 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer visual */}
        <div className="relative z-10">
          <p className="text-white/35 text-sm">
            © 2025 Ticketon · A plataforma de eventos do Brasil
          </p>
        </div>
      </div>

      {/* ========================= LADO DIREITO (formulário) ========================= */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-turquoise rounded-lg flex items-center justify-center">
              <FaTicketAlt className="text-white text-sm" />
            </div>
            <span className="text-xl font-black text-gray-900">Ticketon</span>
          </Link>

          {/* Cabeçalho do form */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Entrar na conta</h1>
            <p className="text-gray-500">
              Não tem uma conta?{' '}
              <Link href={REGISTER_PATH} className="text-turquoise hover:text-turquoise-700 font-semibold transition-colors">
                Criar conta grátis
              </Link>
            </p>
          </div>

          {/* ---- Acesso Rápido (Demo) ---- */}
          <div className="mb-8 p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-gray-300" />
              Acesso rápido — demonstração
              <span className="w-4 h-px bg-gray-300" />
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoLogin(acc)}
                  disabled={demoLoading === acc.role}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ borderColor: acc.border, backgroundColor: acc.bg }}
                >
                  <span className="text-xl leading-none">
                    {demoLoading === acc.role ? '⏳' : acc.icon}
                  </span>
                  <span className="text-xs font-bold leading-tight" style={{ color: acc.color }}>
                    {acc.role}
                  </span>
                  <span className="text-[10px] text-gray-400 leading-tight">{acc.desc}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center">
              Clique para preencher automaticamente com credenciais de teste
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Erro */}
            {displayError && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3.5 rounded-xl text-sm flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">⚠️</span>
                <span>{displayError}</span>
              </div>
            )}

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/15 outline-none text-gray-900 placeholder-gray-400 text-sm bg-white transition-all"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <a href="#" className="text-xs text-turquoise hover:text-turquoise-700 font-medium transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl focus:border-turquoise focus:ring-2 focus:ring-turquoise/15 outline-none text-gray-900 placeholder-gray-400 text-sm bg-white transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 accent-turquoise rounded cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Manter-me conectado
              </label>
            </div>

            {/* Botão de login */}
            <Button
              type="submit"
              className="w-full bg-turquoise hover:bg-turquoise-600 text-white py-4 text-base font-bold rounded-xl shadow-md shadow-turquoise/20 hover:shadow-lg hover:shadow-turquoise/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Entrar
                  <FaArrowRight className="text-sm" />
                </span>
              )}
            </Button>

            {/* Divisor */}
            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">ou continue com</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social login (placeholder visual) */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Google',   emoji: '🔵' },
                { label: 'Facebook', emoji: '🔷' },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <span>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </form>

          {/* Rodapé */}
          <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
            Ao entrar, você concorda com os{' '}
            <a href="/terms" className="text-gray-500 hover:text-gray-700 underline">Termos de Uso</a>
            {' '}e a{' '}
            <a href="/privacy" className="text-gray-500 hover:text-gray-700 underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
