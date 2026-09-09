import { FiClipboard, FiGrid, FiBarChart2 } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import { ConsumptionContainer } from '../containers/ConsumptionContainer';

const navItems: NavItem[] = [
  { label: 'Panel Administrativo', icon: FiGrid, to: '/panel-administrativo' },
  { label: 'Registro de Emisiones', icon: FiClipboard, active: true },
  { label: 'Reportes', icon: FiBarChart2 },
];

export function ConsumptionPage() {
  return (
    <AppShell navItems={navItems}>
      <h1 className="font-display text-2xl font-bold text-ink">Registro de Emisiones</h1>
      <p className="mt-1 text-sm text-graphite">
        Consumo eléctrico por zona del campus para el cálculo de la huella institucional.
      </p>

      <div className="mt-6">
        <ConsumptionContainer />
      </div>
    </AppShell>
  );
}
