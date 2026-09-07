import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/atoms/ThemeToggle';

export function DashboardPlaceholderPage() {
  const { user, clearSession } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-tdea-cream text-center">
      <ThemeToggle className="absolute right-4 top-4" />
      <h1 className="font-display text-2xl font-bold text-ink">
        Hola, {user?.name ?? 'usuario'} 👋
      </h1>
      <p className="text-graphite">
        Sesión iniciada como <span className="font-medium capitalize">{user?.role}</span>. El
        dashboard se construye en el Sprint 4 (HU-09).
      </p>
      <Link
        to="/cuestionario"
        className="rounded-button bg-tdea-green px-4 py-2 text-sm font-bold text-white hover:bg-tdea-green-dark"
      >
        Responder cuestionario de huella individual
      </Link>
      <button
        onClick={clearSession}
        className="rounded-button border border-tdea-blush-border bg-surface px-4 py-2 text-sm font-medium text-graphite hover:bg-tdea-blush"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
