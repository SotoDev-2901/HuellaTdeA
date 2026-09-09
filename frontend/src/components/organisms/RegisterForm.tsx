import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';
import { Input } from '../atoms/Input';

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'estudiante' | 'docente';
  acceptedTerms: boolean;
}

export interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  acceptedTerms?: string;
  form?: string;
}

interface RegisterFormProps {
  values: RegisterFormValues;
  errors: RegisterFormErrors;
  loading: boolean;
  onChange: <K extends keyof RegisterFormValues>(field: K, value: RegisterFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function RegisterForm({ values, errors, loading, onChange, onSubmit }: RegisterFormProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      {errors.form ? (
        <p className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger">{errors.form}</p>
      ) : null}

      <Input
        label="Nombre completo"
        placeholder="Ej. Juan Pérez"
        autoComplete="name"
        value={values.name}
        error={errors.name}
        onChange={(e) => onChange('name', e.target.value)}
      />

      <Input
        label="Correo institucional"
        type="email"
        placeholder="usuario@correo.tdea.edu.co"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(e) => onChange('email', e.target.value)}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-graphite">Tipo de perfil</label>
        <div className="flex gap-3">
          {(['estudiante', 'docente'] as const).map((role) => (
            <button
              type="button"
              key={role}
              onClick={() => onChange('role', role)}
              className={`flex-1 rounded-input border px-3.5 py-2.5 text-sm font-medium capitalize transition-colors ${
                values.role === role
                  ? 'border-tdea-green bg-tdea-green/10 text-tdea-green'
                  : 'border-tdea-blush-border bg-tdea-blush text-graphite'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        {errors.role ? <p className="mt-1 text-xs text-danger">{errors.role}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={values.password}
          error={errors.password}
          onChange={(e) => onChange('password', e.target.value)}
        />
        <Input
          label="Confirmar"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => onChange('confirmPassword', e.target.value)}
        />
      </div>

      <Checkbox
        label="Acepto los términos y condiciones y la política de tratamiento de datos."
        checked={values.acceptedTerms}
        onChange={(e) => onChange('acceptedTerms', e.target.checked)}
      />
      {errors.acceptedTerms ? <p className="text-xs text-danger">{errors.acceptedTerms}</p> : null}

      <Button type="submit" loading={loading}>
        Registrarse →
      </Button>

      <p className="text-center text-sm text-graphite">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-tdea-green hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
