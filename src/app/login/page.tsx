'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '@/hooks';
import { isEmailValid, isFieldEmpty } from '@/lib/utils/validation';

const DEFAULT_ERROR_MESSAGE = 'Por favor, preencha todos os campos';
const LOGIN_REDIRECT = '/organizer/dashboard';
const REGISTER_PATH = '/register';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (isFieldEmpty(email) || isFieldEmpty(password)) {
      setLocalError(DEFAULT_ERROR_MESSAGE);
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
      setLocalError('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue via-turquoise/20 to-light-green/30 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="w-16 h-16 bg-gradient-to-br from-turquoise to-light-green rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSignInAlt className="text-2xl text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-dark-gray">Login</CardTitle>
          <p className="text-medium-gray mt-2">Entre na sua conta para continuar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {displayError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {displayError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-gray mb-2">
                E-mail
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-gray mb-2">
                Senha
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-turquoise hover:bg-turquoise/90 text-white py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-medium-gray">
                Não tem uma conta?{' '}
                <a href={REGISTER_PATH} className="text-turquoise hover:underline font-medium">
                  Cadastre-se
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
