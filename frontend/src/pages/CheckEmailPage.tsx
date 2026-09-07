import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/molecules/AuthLayout';
import { Button } from '../components/atoms/Button';
import * as authService from '../services/authService';

export function CheckEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleResend() {
    if (!email) return;
    setStatus('sending');
    try {
      await authService.resendVerification(email);
    } finally {
      setStatus('sent');
    }
  }

  return (
    <AuthLayout title="Revisa tu correo" subtitle="Te enviamos un enlace para activar tu cuenta">
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-graphite">
          {email ? (
            <>
              Enviamos un correo de verificación a <span className="font-medium text-ink">{email}</span>.
              Haz clic en el enlace para activar tu cuenta antes de iniciar sesión.
            </>
          ) : (
            'Enviamos un correo de verificación a tu cuenta. Haz clic en el enlace para activarla.'
          )}
        </p>

        {email ? (
          <Button type="button" onClick={handleResend} loading={status === 'sending'}>
            Reenviar correo
          </Button>
        ) : null}
        {status === 'sent' ? (
          <p className="text-xs text-tdea-green">Si tu cuenta existe y no está verificada, enviamos un nuevo enlace.</p>
        ) : null}

        <Link to="/login" className="text-sm font-medium text-tdea-green hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
