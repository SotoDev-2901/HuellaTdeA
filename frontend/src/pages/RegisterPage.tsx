import { AuthLayout } from '../components/molecules/AuthLayout';
import { RegisterContainer } from '../containers/RegisterContainer';

export function RegisterPage() {
  return (
    <AuthLayout title="Crear Cuenta" subtitle="Únete a la iniciativa de sostenibilidad del TdeA">
      <RegisterContainer />
    </AuthLayout>
  );
}
