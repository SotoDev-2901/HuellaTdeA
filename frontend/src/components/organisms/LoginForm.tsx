import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';
import { Input } from '../atoms/Input';

export interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  form?: string;
  unverified?: boolean;
}

interface LoginFormProps {
  values: LoginFormValues;
  errors: LoginFormErrors;
  loading: boolean;
  resending: boolean;
  onChange: <K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResendVerification: () => void;
}

export function LoginForm({
  values,
  errors,
  loading,
  resending,
  onChange,
  onSubmit,
  onResendVerification,
}: LoginFormProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      {errors.form ? (
        <div className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger">
          <p>{errors.form}</p>
          {errors.unverified ? (
            <button
              type="button"
              onClick={onResendVerification}
              disabled={resending}
              className="mt-1 font-medium underline disabled:opacity-60"
            >
              {resending ? 'Enviando...' : 'Reenviar correo de verificación'}
            </button>
          ) : null}
        </div>
      ) : null}

      <Input
        label="Correo institucional"
        type="email"
        placeholder="usuario@correo.tdea.edu.co"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(e) => onChange('email', e.target.value)}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        value={values.password}
        error={errors.password}
        onChange={(e) => onChange('password', e.target.value)}
      />

      <div className="flex items-center justify-between">
        <Checkbox
          label="Recordarme"
          checked={values.remember}
          onChange={(e) => onChange('remember', e.target.checked)}
        />
        <Link to="/olvide-mi-contrasena" className="text-xs font-medium text-tdea-green hover:underline">
          Olvidé mi contraseña
        </Link>
      </div>

      <Button type="submit" loading={loading}>
        Iniciar sesión →
      </Button>

      <p className="text-center text-sm text-graphite">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium text-tdea-green hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
