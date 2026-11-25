import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/molecules/AuthLayout';
import { Button } from '../components/atoms/Button';
import { ApiError } from '../lib/api';
import * as authService from '../services/authService';

type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * La cuenta se verifica solo cuando la persona presiona «Confirmar mi correo», no al cargar la página.
 * Algunos filtros de correo (por ejemplo, Safe Links de Microsoft 365) abren los enlaces con un navegador
 * antes de entregar el mensaje: si la verificación fuera automática, esos filtros activarían la cuenta
 * sin que el dueño del correo lo confirme. Los filtros no presionan botones.
 */
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>(token ? 'idle' : 'error');
  const [message, setMessage] = useState(
    token ? 'Confirma tu correo para activar tu cuenta.' : 'El enlace de verificación no es válido.',
  );

  async function handleConfirm() {
    if (!token) return;
    setStatus('loading');
    setMessage('Verificando tu correo...');
    try {
      const res = await authService.verifyEmail(token);
      setStatus('success');
      setMessage(res.message);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof ApiError ? err.message : 'No se pudo verificar el correo');
    }
  }

  const waiting = status === 'idle' || status === 'loading';

  return (
    <AuthLayout title="Verificación de correo" subtitle="Activando tu cuenta">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className={`text-sm ${status === 'error' ? 'text-danger' : 'text-graphite'}`}>{message}</p>
        {waiting ? (
          <Button type="button" onClick={handleConfirm} loading={status === 'loading'}>
            Confirmar mi correo
          </Button>
        ) : (
          <Link to="/login" className="font-medium text-tdea-green hover:underline">
            Ir a iniciar sesión
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
