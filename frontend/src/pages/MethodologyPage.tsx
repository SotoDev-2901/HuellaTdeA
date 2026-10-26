import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/organisms/AppShell';
import { MethodologyContainer } from '../containers/MethodologyContainer';
import { navFor } from '../lib/navigation';

export function MethodologyPage() {
  const { user } = useAuth();
  const { items, brand } = navFor(user?.role);
  return (
    <AppShell navItems={items} brand={brand}>
      <h1 className="font-display text-2xl font-bold text-ink">¿Cómo se calcula tu huella?</h1>
      <p className="mt-1 max-w-2xl text-sm text-graphite">
        Aquí ves, sin letra pequeña, qué datos usamos, de dónde salen los factores y qué parte son
        supuestos nuestros. Los valores de esta página son exactamente los que aplica el sistema.
      </p>
      <div className="mt-6">
        <MethodologyContainer />
      </div>
    </AppShell>
  );
}
