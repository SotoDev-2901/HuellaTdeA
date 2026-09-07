import { AuthLayout } from '../components/molecules/AuthLayout';
import { LoginContainer } from '../containers/LoginContainer';

export function LoginPage() {
  return (
    <AuthLayout title="Iniciar Sesión" subtitle="Bienvenido de nuevo al sistema de gestión ambiental">
      <LoginContainer />
    </AuthLayout>
  );
}
