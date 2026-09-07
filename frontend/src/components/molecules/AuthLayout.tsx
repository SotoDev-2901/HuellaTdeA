import type { ReactNode } from 'react';
import { Logo } from '../atoms/Logo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-tdea-cream px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-tdea-green-light/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-tdea-green/10 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo />
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
            <p className="mt-1 text-sm text-graphite">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-card bg-white p-8 shadow-soft">{children}</div>

        <p className="mt-8 text-center text-xs text-silver">
          © {new Date().getFullYear()} Tecnológico de Antioquia. Sistema de Gestión de Huella de
          Carbono.
        </p>
      </div>
    </div>
  );
}
