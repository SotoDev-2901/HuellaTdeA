import { useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { Logo } from '../atoms/Logo';
import { ThemeToggle } from '../atoms/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export interface NavItem {
  label: string;
  icon: IconType;
  active?: boolean;
}

interface AppShellProps {
  navItems: NavItem[];
  children: ReactNode;
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppShell({ navItems, children }: AppShellProps) {
  const { user, clearSession } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-tdea-cream">
      <aside
        className={`relative flex flex-col justify-between border-r border-tdea-blush-border bg-surface py-6 transition-all duration-200 ${
          collapsed ? 'w-20 px-2' : 'w-60 px-4'
        }`}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-tdea-blush-border bg-surface text-graphite shadow-soft hover:text-tdea-green"
        >
          <CollapseIcon collapsed={collapsed} />
        </button>

        <div>
          <div className={`mb-8 flex ${collapsed ? 'justify-center px-0' : 'px-2'}`}>
            <Logo compact={collapsed} />
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <span
                key={item.label}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-2.5 truncate rounded-input px-3 py-2 text-sm font-medium ${
                  collapsed ? 'justify-center' : ''
                } ${item.active ? 'bg-tdea-green/10 text-tdea-green' : 'text-graphite'}`}
              >
                <item.icon size={18} className="shrink-0" />
                {collapsed ? null : item.label}
              </span>
            ))}
          </nav>
        </div>

        <div
          className={`flex items-center gap-2 rounded-input border border-tdea-blush-border py-2 ${
            collapsed ? 'flex-col px-0' : 'px-3'
          }`}
        >
          <div
            title={`${user?.name ?? ''} · ${user?.email ?? ''}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tdea-green text-xs font-bold text-white"
          >
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          {collapsed ? (
            <button
              onClick={clearSession}
              title="Cerrar sesión"
              className="text-xs font-medium text-tdea-green hover:underline"
            >
              Salir
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
