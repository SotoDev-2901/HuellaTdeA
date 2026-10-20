import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/organisms/AppShell';
import { ProfileContainer } from '../containers/ProfileContainer';
import { navFor } from '../lib/navigation';

export function ProfilePage() {
  const { user } = useAuth();
  const { items, brand } = navFor(user?.role);
  return (
    <AppShell navItems={items} brand={brand}>
      <h1 className="font-display text-2xl font-bold text-ink">Mi cuenta</h1>
      <p className="mt-1 text-sm text-graphite">Administra tus datos, tu contraseña y tu cuenta.</p>
      <div className="mt-6">
        <ProfileContainer />
      </div>
    </AppShell>
  );
}
