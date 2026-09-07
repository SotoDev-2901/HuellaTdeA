import type { InputHTMLAttributes, ReactNode } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Checkbox({ label, id, className = '', ...rest }: CheckboxProps) {
  const inputId = id ?? 'checkbox';

  return (
    <label htmlFor={inputId} className="flex cursor-pointer items-start gap-2 text-xs text-graphite">
      <input
        id={inputId}
        type="checkbox"
        className={`mt-0.5 h-4 w-4 rounded border-tdea-blush-border text-tdea-green focus:ring-tdea-green/40 ${className}`}
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}
