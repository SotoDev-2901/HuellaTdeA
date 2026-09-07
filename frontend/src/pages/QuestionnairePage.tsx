import { FiEdit3, FiHome } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import { QuestionnaireContainer } from '../containers/QuestionnaireContainer';

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: FiHome },
  { label: 'Cuestionario', icon: FiEdit3, active: true },
];

export function QuestionnairePage() {
  return (
    <AppShell navItems={navItems}>
      <div className="mx-auto max-w-xl">
        <div className="rounded-card bg-white p-6 shadow-soft">
          <QuestionnaireContainer />
        </div>
      </div>
    </AppShell>
  );
}
