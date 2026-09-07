import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormErrors {
  password?: string;
  confirmPassword?: string;
  form?: string;
}

interface ResetPasswordFormProps {
  values: ResetPasswordFormValues;
  errors: ResetPasswordFormErrors;
  loading: boolean;
  done: boolean;
  onChange: <K extends keyof ResetPasswordFormValues>(field: K, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ResetPasswordForm({
  values,
  errors,
  loading,
  done,
  onChange,
  onSubmit,
}: ResetPasswordFormProps) {
  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-graphite">Tu contraseña fue actualizada correctamente.</p>
        <Link to="/login" className="text-sm font-medium text-tdea-green hover:underline">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      {errors.form ? (
        <p className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger">{errors.form}</p>
      ) : null}

      <Input
        label="Nueva contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        value={values.password}
        error={errors.password}
        onChange={(e) => onChange('password', e.target.value)}
      />
      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(e) => onChange('confirmPassword', e.target.value)}
      />

      <Button type="submit" loading={loading}>
        Restablecer contraseña →
      </Button>
    </form>
  );
}
