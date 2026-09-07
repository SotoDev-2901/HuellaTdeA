import { useState, type FormEvent } from 'react';
import {
  ForgotPasswordForm,
  type ForgotPasswordFormErrors,
  type ForgotPasswordFormValues,
} from '../components/organisms/ForgotPasswordForm';
import { ApiError } from '../lib/api';
import * as authService from '../services/authService';

export function ForgotPasswordContainer() {
  const [values, setValues] = useState<ForgotPasswordFormValues>({ email: '' });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      setErrors({ email: 'Correo inválido' });
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo enviar el correo';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ForgotPasswordForm
      values={values}
      errors={errors}
      loading={loading}
      sent={sent}
      onChange={(email) => setValues({ email })}
      onSubmit={handleSubmit}
    />
  );
}
