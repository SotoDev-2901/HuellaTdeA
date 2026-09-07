import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ForgotPasswordFormErrors {
  email?: string;
  form?: string;
}

interface ForgotPasswordFormProps {
  values: ForgotPasswordFormValues;
  errors: ForgotPasswordFormErrors;
  loading: boolean;
  sent: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ForgotPasswordForm({
  values,
  errors,
  loading,
  sent,
  onChange,
  onSubmit,
}: ForgotPasswordFormProps) {
  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-graphite">
          Si <span className="font-medium text-ink">{values.email}</span> está registrado, enviamos
          instrucciones para restablecer tu contraseña.
        </p>
        <Link to="/login" className="text-sm font-medium text-tdea-green hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      {errors.form ? (
        <p className="rounded-input bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>
      ) : null}

      <Input
        label="Correo institucional"
        type="email"
        placeholder="usuario@correo.tdea.edu.co"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(e) => onChange(e.target.value)}
      />

      <Button type="submit" loading={loading}>
        Enviar instrucciones →
      </Button>

      <p className="text-center text-sm text-graphite">
        <Link to="/login" className="font-medium text-tdea-green hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
