import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToasts((prev) => {
      // Evita duplicados cuando varias peticiones fallan casi al mismo tiempo (ej. sesión
      // expirada disparando el mismo aviso desde más de una llamada concurrente).
      if (prev.some((t) => t.message === message && t.type === type)) return prev;
      const id = nextId++;
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 3500);
      return [...prev, { id, message, type }];
    });
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="print-hide fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-input px-4 py-3 text-sm font-medium shadow-soft ${
              toast.type === 'success' ? 'bg-tdea-green text-white' : 'bg-danger text-white'
            }`}
          >
            {toast.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}
