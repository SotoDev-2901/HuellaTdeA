import { FiBarChart2, FiClock, FiEdit3, FiHome } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import { QuestionnaireContainer } from '../containers/QuestionnaireContainer';

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: FiHome, to: '/dashboard' },
  { label: 'Cuestionario', icon: FiEdit3, active: true },
  { label: 'Historial', icon: FiClock, to: '/historial' },
  { label: 'Huella TdeA', icon: FiBarChart2, to: '/reportes' },
];

const brand = { title: 'TDEA HUELLA' };

export function QuestionnairePage() {
  return (
    <AppShell navItems={navItems} brand={brand}>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-card bg-surface p-8 shadow-soft">
          <QuestionnaireContainer />
        </div>
      </div>
    </AppShell>
  );
}
