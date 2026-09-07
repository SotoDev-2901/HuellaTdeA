import { FiClock, FiEdit3, FiHome } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import { QuestionnaireContainer } from '../containers/QuestionnaireContainer';

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: FiHome, to: '/dashboard' },
  { label: 'Cuestionario', icon: FiEdit3, active: true },
  { label: 'Historial', icon: FiClock, to: '/historial' },
];

const brand = { title: 'TDEA HUELLA', subtitle: 'Carbon Tracking' };

export function QuestionnairePage() {
  return (
    <AppShell navItems={navItems} brand={brand} topBarTitle="Footprint Wizard">
      <div className="mx-auto max-w-xl">
        <div className="rounded-card bg-surface p-6 shadow-soft">
          <QuestionnaireContainer />
        </div>
      </div>
    </AppShell>
  );
}
