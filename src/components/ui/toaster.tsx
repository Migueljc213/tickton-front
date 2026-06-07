'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: 'var(--font-geist-sans)',
          borderRadius: '12px',
          fontSize: '0.875rem',
        },
        classNames: {
          toast: 'shadow-lg',
        },
      }}
    />
  );
}
