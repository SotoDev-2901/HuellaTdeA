import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LoginForm,
  type LoginFormErrors,
  type LoginFormValues,
} from '../components/organisms/LoginForm';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import * as authService from '../services/authService';

const initialValues: LoginFormValues = { email: '', password: '', remember: false };

export function LoginContainer() {
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  function handleChange<K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    if (!values.email || !values.password) {
      setErrors({ form: 'Ingresa tu correo y contraseña' });
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await authService.login({
        email: values.email,
        password: values.password,
      });
      setSession(user, token, values.remember);
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo iniciar sesión';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginForm
      values={values}
      errors={errors}
      loading={loading}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
