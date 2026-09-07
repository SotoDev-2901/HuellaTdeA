import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function Button({ children, loading, disabled, className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex w-full items-center justify-center gap-2 rounded-button bg-tdea-green px-6 py-3 font-display text-base font-bold text-white transition-colors hover:bg-tdea-green-dark disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Procesando...' : children}
    </button>
  );
}
