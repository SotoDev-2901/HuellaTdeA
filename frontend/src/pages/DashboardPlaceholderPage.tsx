import { useAuth } from '../context/AuthContext';

export function DashboardPlaceholderPage() {
  const { user, clearSession } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-tdea-cream text-center">
      <h1 className="font-display text-2xl font-bold text-ink">
        Hola, {user?.name ?? 'usuario'} 👋
      </h1>
      <p className="text-graphite">
        Sesión iniciada como <span className="font-medium capitalize">{user?.role}</span>. El
        dashboard se construye en el Sprint 4 (HU-09).
      </p>
      <button
        onClick={clearSession}
        className="rounded-button border border-tdea-blush-border bg-white px-4 py-2 text-sm font-medium text-graphite hover:bg-tdea-blush"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
