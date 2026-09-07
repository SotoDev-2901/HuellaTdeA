import { AuthLayout } from '../components/molecules/AuthLayout';
import { ForgotPasswordContainer } from '../containers/ForgotPasswordContainer';

export function ForgotPasswordPage() {
  return (
    <AuthLayout title="Olvidé mi contraseña" subtitle="Te enviaremos instrucciones a tu correo institucional">
      <ForgotPasswordContainer />
    </AuthLayout>
  );
}
