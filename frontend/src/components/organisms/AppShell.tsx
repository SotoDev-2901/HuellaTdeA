import { useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { Link } from 'react-router-dom';
import { Logo } from '../atoms/Logo';
import { ThemeToggle } from '../atoms/ThemeToggle';
import { NotificationBell } from '../atoms/NotificationBell';
import { HelpButton } from '../atoms/HelpButton';
import { useAuth } from '../../context/AuthContext';

export interface NavItem {
  label: string;
  icon: IconType;
  active?: boolean;
  to?: string;
}

interface AppShellProps {
  navItems: NavItem[];
  children: ReactNode;
  /** Marca alterna para el sidebar (ej. "TDEA HUELLA" / "CARBON TRACKING"). Si no se pasa, se usa el logo institucional solo. */
  brand?: { title: string; subtitle: string };
  /** Si se pasa, muestra una barra superior con título + notificaciones/ayuda/tema, como en el wizard del cuestionario. */
  topBarTitle?: string;
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

export function AppShell({ navItems, children, brand, topBarTitle }: AppShellProps) {
  const { user, clearSession } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell-root flex h-screen overflow-hidden bg-tdea-cream">
      <div
        className={`print-hide relative h-screen shrink-0 transition-all duration-200 ${collapsed ? 'w-20' : 'w-60'}`}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-tdea-blush-border bg-surface text-graphite shadow-soft hover:text-tdea-green"
        >
          <CollapseIcon collapsed={collapsed} />
        </button>

        <aside
          className={`flex h-screen flex-col justify-between overflow-y-auto border-r border-tdea-blush-border bg-surface py-6 transition-all duration-200 ${
            collapsed ? 'w-20 px-2' : 'w-60 px-4'
          }`}
        >

        <div>
          <div className={`mb-8 flex items-center gap-2 ${collapsed ? 'justify-center px-0' : 'px-2'}`}>
            <Logo compact={collapsed || Boolean(brand)} />
            {!collapsed && brand ? (
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-ink">{brand.title}</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-silver">
                  {brand.subtitle}
                </p>
              </div>
            ) : null}
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const className = `flex items-center gap-2.5 truncate rounded-input px-3 py-2 text-sm font-medium transition-all duration-150 ${
                collapsed ? 'justify-center' : ''
              } ${
                item.active
                  ? 'bg-tdea-green/10 text-tdea-green'
                  : 'text-graphite hover:translate-x-0.5 hover:bg-tdea-blush'
              }`;
              const content = (
                <>
                  <item.icon size={18} className="shrink-0" />
                  {collapsed ? null : item.label}
                </>
              );

              return item.to ? (
                <Link key={item.label} to={item.to} title={collapsed ? item.label : undefined} className={className}>
                  {content}
                </Link>
              ) : (
                <span key={item.label} title={collapsed ? item.label : undefined} className={className}>
                  {content}
                </span>
              );
            })}
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
      </div>

      <main className="relative flex-1 overflow-auto bg-gradient-to-br from-tdea-cream via-tdea-cream to-tdea-panel">
        <div
          aria-hidden="true"
          className="print-hide pointer-events-none fixed -right-24 -top-24 h-96 w-96 rounded-full bg-tdea-green-light/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="print-hide pointer-events-none fixed -left-24 bottom-0 h-96 w-96 rounded-full bg-tdea-green/10 blur-3xl"
        />

        <div className="relative p-8">
          {topBarTitle ? (
            <div className="print-hide mb-6 flex items-center justify-between border-b border-tdea-blush-border pb-4">
              <h1 className="font-display text-lg font-bold text-ink">{topBarTitle}</h1>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <HelpButton />
                <ThemeToggle />
                <div
                  title={user?.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-tdea-green text-xs font-bold text-white"
                >
                  {user?.name?.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          ) : (
            <div className="print-hide mb-4 flex justify-end">
              <ThemeToggle />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
