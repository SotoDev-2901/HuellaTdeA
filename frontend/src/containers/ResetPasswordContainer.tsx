import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ResetPasswordForm,
  type ResetPasswordFormErrors,
  type ResetPasswordFormValues,
} from '../components/organisms/ResetPasswordForm';
import { ApiError } from '../lib/api';
import * as authService from '../services/authService';

const initialValues: ResetPasswordFormValues = { password: '', confirmPassword: '' };

export function ResetPasswordContainer() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [values, setValues] = useState<ResetPasswordFormValues>(initialValues);
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function handleChange<K extends keyof ResetPasswordFormValues>(field: K, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    if (!token) {
      setErrors({ form: 'El enlace de recuperación no es válido' });
      return;
    }
    if (values.password.length < 8) {
      setErrors({ password: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }
    if (values.password !== values.confirmPassword) {
      setErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, values.password);
      setDone(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResetPasswordForm
      values={values}
      errors={errors}
      loading={loading}
      done={done}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
