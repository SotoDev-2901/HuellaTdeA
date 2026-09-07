import { AuthLayout } from '../components/molecules/AuthLayout';
import { ResetPasswordContainer } from '../containers/ResetPasswordContainer';

export function ResetPasswordPage() {
  return (
    <AuthLayout title="Restablecer contraseña" subtitle="Elige una nueva contraseña para tu cuenta">
      <ResetPasswordContainer />
    </AuthLayout>
  );
}
