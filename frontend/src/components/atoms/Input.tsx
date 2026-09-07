import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.4 6.4C4 8 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.5 4.8-1.2M17.6 17.6C20 16 22 12 22 12s-1.3-2.6-3.6-4.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Input({ label, icon, error, id, className = '', type, ...rest }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="flex items-center gap-1.5 text-sm font-medium text-graphite"
      >
        {icon}
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && visible ? 'text' : type}
          className={`w-full rounded-input border bg-tdea-blush px-3.5 py-2.5 text-sm text-ink placeholder:text-silver focus:outline-none focus:ring-2 focus:ring-tdea-green/40 ${
            isPassword ? 'pr-10' : ''
          } ${error ? 'border-red-400' : 'border-tdea-blush-border'} ${className}`}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-silver hover:text-graphite"
          >
            <EyeIcon open={visible} />
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
