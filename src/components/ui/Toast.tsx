'use client';

import { useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

export type ToastType = 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const toast = {
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
  };

  return { toasts, toast, dismiss };
}

interface ToastContainerProps {
  toasts: ToastItem[];
  dismiss: (id: number) => void;
}

export function ToastContainer({ toasts, dismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{ animation: 'toast-in 0.25s ease-out forwards' }}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            t.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {t.type === 'success' ? (
            <FaCheckCircle className="text-green-500 flex-shrink-0 mt-0.5 text-base" />
          ) : (
            <FaExclamationCircle className="text-red-500 flex-shrink-0 mt-0.5 text-base" />
          )}
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
}
