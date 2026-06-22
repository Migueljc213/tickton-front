'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { storage } from '@/lib/utils/storage';

function SocialAuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const token  = params.get('token');
    const userId = params.get('userId');
    const email  = params.get('email');
    const name   = params.get('name');
    const role   = params.get('role');
    const error  = params.get('error');

    if (error || !token) {
      setStatus('error');
      setTimeout(() => router.replace('/login?error=social_fail'), 2500);
      return;
    }

    storage.setToken(token);
    if (userId) storage.setUserId(Number(userId));
    if (email)  storage.setUserEmail(email);
    if (name)   storage.setUserName(name);
    if (role)   storage.setUserRole(role);

    const redirect = role === 'organizer'
      ? '/organizer/dashboard'
      : role === 'admin'
      ? '/admin/dashboard'
      : '/events';

    router.replace(redirect);
  }, [params, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      {status === 'loading' ? (
        <>
          <div className="w-12 h-12 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Autenticando...</p>
        </>
      ) : (
        <>
          <span className="text-4xl">⚠️</span>
          <p className="text-red-600 font-medium">Erro ao autenticar. Redirecionando...</p>
        </>
      )}
    </div>
  );
}

export default function SocialAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SocialAuthContent />
    </Suspense>
  );
}
