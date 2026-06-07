'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/utils/storage';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const role = storage.getUserRole();
    if (role === 'admin') router.replace('/admin/dashboard');
    else if (role === 'organizer') router.replace('/organizer/dashboard');
    else router.replace('/tickets');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #00C2A8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Redirecionando...</p>
      </div>
    </div>
  );
}
