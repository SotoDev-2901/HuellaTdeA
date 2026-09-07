import type { ReactNode } from 'react';
import { Logo } from '../atoms/Logo';
import { useAuth } from '../../context/AuthContext';

interface AppShellProps {
  navItems: { label: string; active?: boolean }[];
  children: ReactNode;
}

export function AppShell({ navItems, children }: AppShellProps) {
  const { user, clearSession } = useAuth();

  return (
    <div className="flex min-h-screen bg-tdea-cream">
      <aside className="flex w-60 flex-col justify-between border-r border-tdea-blush-border bg-white px-4 py-6">
        <div>
          <div className="mb-8 px-2">
            <Logo />
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <span
                key={item.label}
                className={`rounded-input px-3 py-2 text-sm font-medium ${
                  item.active ? 'bg-tdea-green/10 text-tdea-green' : 'text-graphite'
                }`}
              >
                {item.label}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 rounded-input border border-tdea-blush-border px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tdea-green text-xs font-bold text-white">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate text-xs text-silver">{user?.email}</p>
          </div>
          <button
            onClick={clearSession}
            title="Cerrar sesión"
            className="text-xs font-medium text-tdea-green hover:underline"
          >
            Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
