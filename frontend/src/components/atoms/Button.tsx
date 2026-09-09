import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function Button({ children, loading, disabled, className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex w-full items-center justify-center gap-2 rounded-button bg-tdea-green px-6 py-3 font-display text-base font-bold text-white shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:bg-tdea-green-dark hover:shadow-lg active:translate-y-0 active:shadow-soft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-soft ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Procesando...' : children}
    </button>
  );
}
