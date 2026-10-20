import { FiClipboard, FiGrid, FiBarChart2, FiHome, FiEdit3, FiClock } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import { ReportsContainer } from '../containers/ReportsContainer';
import { useAuth } from '../context/AuthContext';

const adminNavItems: NavItem[] = [
  { label: 'Panel Administrativo', icon: FiGrid, to: '/panel-administrativo' },
  { label: 'Registro de Emisiones', icon: FiClipboard, to: '/consumo' },
  { label: 'Reportes', icon: FiBarChart2, active: true },
];

const communityNavItems: NavItem[] = [
  { label: 'Dashboard', icon: FiHome, to: '/dashboard' },
  { label: 'Cuestionario', icon: FiEdit3, to: '/cuestionario' },
  { label: 'Historial', icon: FiClock, to: '/historial' },
  { label: 'Huella TdeA', icon: FiBarChart2, active: true },
];

const brand = { title: 'TDEA HUELLA' };

export function ReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrador';

  return (
    <AppShell navItems={isAdmin ? adminNavItems : communityNavItems} brand={isAdmin ? undefined : brand}>
      <h1 className="font-display text-2xl font-bold text-ink">
        {isAdmin ? 'Reportes' : 'Huella de Carbono de TdeA'}
      </h1>
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
