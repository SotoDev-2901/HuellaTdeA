import { FiClipboard, FiGrid, FiBarChart2 } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import { ReportsContainer } from '../containers/ReportsContainer';

const navItems: NavItem[] = [
  { label: 'Panel Administrativo', icon: FiGrid, to: '/panel-administrativo' },
  { label: 'Registro de Emisiones', icon: FiClipboard, to: '/consumo' },
  { label: 'Reportes', icon: FiBarChart2, active: true },
];

export function ReportsPage() {
  return (
    <AppShell navItems={navItems}>
      <h1 className="font-display text-2xl font-bold text-ink">Reportes</h1>
      <p className="mt-1 text-sm text-graphite">
        Huella de carbono institucional calculada a partir del consumo eléctrico y los residuos
        registrados por zona.
      </p>

      <div className="mt-6">
        <ReportsContainer />
      </div>
    </AppShell>
  );
}
