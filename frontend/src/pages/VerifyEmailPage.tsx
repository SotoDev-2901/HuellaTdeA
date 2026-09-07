import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/molecules/AuthLayout';
import { ApiError } from '../lib/api';
import * as authService from '../services/authService';

type Status = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verificando tu correo...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('El enlace de verificación no es válido.');
      return;
    }

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof ApiError ? err.message : 'No se pudo verificar el correo');
      });
  }, [token]);

  return (
    <AuthLayout title="Verificación de correo" subtitle="Activando tu cuenta">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className={`text-sm ${status === 'error' ? 'text-danger' : 'text-graphite'}`}>{message}</p>
        {status !== 'loading' ? (
          <Link to="/login" className="font-medium text-tdea-green hover:underline">
            Ir a iniciar sesión
          </Link>
        ) : null}
      </div>
    </AuthLayout>
  );
}
