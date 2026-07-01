'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '@/hooks';
import { isEmailValid, isFieldEmpty } from '@/lib/utils/validation';

const REGISTER_PATH  = '/register';

function getRedirectByRole(role: string): string {
  if (role === 'admin')     return '/admin/dashboard';
  if (role === 'organizer') return '/organizer/dashboard';
  return '/tickets';
}

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error } = useAuth();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError]     = useState<string | null>(null);
  const [demoLoading, setDemoLoading]   = useState<string | null>(null);

  const successMessage = searchParams.get('message') === 'organizer-created'
    ? 'Conta de organizador criada! Faça login para acessar o painel.'
    : null;

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
      const response = await login({ email, password });
      router.push(getRedirectByRole(response.role));
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
      const response = await login({ email: account.email, password: account.password });
      router.push(getRedirectByRole(response.role));
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
        <Link href="/" className="relative z-10">
          <Image
            src="/logo-ticketon.png"
            alt="Ticketon"
            width={180}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
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
          <Link href="/" className="flex mb-8 lg:hidden">
            <Image
              src="/logo-ticketon.png"
              alt="Ticketon"
              width={140}
              height={36}
              className="h-9 w-auto object-contain"
            />
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

          {successMessage && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6">
              <FaCheckCircle className="flex-shrink-0" />
              {successMessage}
            </div>
          )}

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

            {/* Social login */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/auth/google`}
                className="flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </a>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/auth/facebook`}
                className="flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
