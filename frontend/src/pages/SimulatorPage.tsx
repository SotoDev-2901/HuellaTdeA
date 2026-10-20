import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/organisms/AppShell';
import { SimulatorContainer } from '../containers/SimulatorContainer';
import { navFor } from '../lib/navigation';

export function SimulatorPage() {
  const { user } = useAuth();
  const { items, brand } = navFor(user?.role);
  return (
    <AppShell navItems={items} brand={brand}>
      <h1 className="font-display text-2xl font-bold text-ink">Simulador: ¿qué pasaría si…?</h1>
      <p className="mt-1 max-w-2xl text-sm text-graphite">
        Explora cómo cambiaría la huella de carbono del TdeA si la comunidad cambia sus hábitos o el campus mejora su eficiencia.
      </p>
      <div className="mt-6">
        <SimulatorContainer />
      </div>
    </AppShell>
  );
}
