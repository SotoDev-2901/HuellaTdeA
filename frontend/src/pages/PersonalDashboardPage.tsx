import { FiHome, FiEdit3, FiClock, FiBarChart2 } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import { PersonalDashboardContainer } from '../containers/PersonalDashboardContainer';

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: FiHome, active: true },
  { label: 'Cuestionario', icon: FiEdit3, to: '/cuestionario' },
  { label: 'Historial', icon: FiClock, to: '/historial' },
  { label: 'Huella TdeA', icon: FiBarChart2, to: '/reportes' },
];

const brand = { title: 'TDEA HUELLA' };

export function PersonalDashboardPage() {
  return (
    <AppShell navItems={navItems} brand={brand}>
      <h1 className="font-display text-2xl font-bold text-ink">Mi Huella de Carbono Personal</h1>
      <p className="mt-1 text-sm text-graphite">
        Tu huella individual, cómo evoluciona en el tiempo y cómo te comparas con el resto de TdeA.
      </p>

      <div className="mt-6">
        <PersonalDashboardContainer />
      </div>
    </AppShell>
  );
}
