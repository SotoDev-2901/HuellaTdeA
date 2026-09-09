import { FiClipboard, FiGrid, FiBarChart2 } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import { ZonesContainer } from '../containers/ZonesContainer';

const navItems: NavItem[] = [
  { label: 'Panel Administrativo', icon: FiGrid, active: true },
  { label: 'Registro de Emisiones', icon: FiClipboard, to: '/consumo' },
  { label: 'Reportes', icon: FiBarChart2 },
];

export function ZonesPage() {
  return (
    <AppShell navItems={navItems}>
      <h1 className="font-display text-2xl font-bold text-ink">Panel Administrativo</h1>
      <p className="mt-1 text-sm text-graphite">
        Gestión de infraestructura y registro de datos ambientales para el cálculo de huella de
        carbono.
      </p>

      <div className="mt-6">
        <ZonesContainer />
      </div>
    </AppShell>
  );
}
