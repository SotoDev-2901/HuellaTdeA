import { useState } from 'react';
import { FiClipboard, FiGrid, FiBarChart2 } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import { ConsumptionContainer } from '../containers/ConsumptionContainer';
import { WasteContainer } from '../containers/WasteContainer';

const navItems: NavItem[] = [
  { label: 'Panel Administrativo', icon: FiGrid, to: '/panel-administrativo' },
  { label: 'Registro de Emisiones', icon: FiClipboard, active: true },
  { label: 'Reportes', icon: FiBarChart2 },
];

type Tab = 'consumo' | 'residuos';

export function ConsumptionPage() {
  const [tab, setTab] = useState<Tab>('consumo');

  return (
    <AppShell navItems={navItems}>
      <h1 className="font-display text-2xl font-bold text-ink">Registro de Emisiones</h1>
      <p className="mt-1 text-sm text-graphite">
        Consumo eléctrico y residuos por zona del campus para el cálculo de la huella institucional.
      </p>

      <div className="mt-6 flex gap-2 border-b border-tdea-blush-border">
        <button
          type="button"
          onClick={() => setTab('consumo')}
          className={`px-4 py-2.5 text-sm font-medium ${
            tab === 'consumo'
              ? 'border-b-2 border-tdea-green text-tdea-green'
              : 'text-graphite hover:text-ink'
          }`}
        >
          Consumo eléctrico
        </button>
        <button
          type="button"
          onClick={() => setTab('residuos')}
          className={`px-4 py-2.5 text-sm font-medium ${
            tab === 'residuos'
              ? 'border-b-2 border-tdea-green text-tdea-green'
              : 'text-graphite hover:text-ink'
          }`}
        >
          Residuos
        </button>
      </div>

      <div className="mt-6">
        {tab === 'consumo' ? <ConsumptionContainer /> : <WasteContainer />}
      </div>
    </AppShell>
  );
}
