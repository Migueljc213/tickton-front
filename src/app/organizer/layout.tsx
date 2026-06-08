'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/utils/storage';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = storage.getToken();
    const role = storage.getUserRole();

    if (!token) {
      router.replace('/login');
      return;
    }

    if (role === 'organizer' || role === 'admin') {
      setAllowed(true);
      return;
    }

    if (role === 'participant') {
      router.replace('/become-organizer');
      return;
    }

    router.replace('/login');
  }, [router]);

  if (!allowed) return null;

  return <>{children}</>;
}
