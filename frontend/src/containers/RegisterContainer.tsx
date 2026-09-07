import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RegisterForm,
  type RegisterFormErrors,
  type RegisterFormValues,
} from '../components/organisms/RegisterForm';
import { ApiError } from '../lib/api';
import * as authService from '../services/authService';

const INSTITUTIONAL_DOMAIN = '@correo.tdea.edu.co';

const initialValues: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'estudiante',
  acceptedTerms: false,
};

function validate(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (values.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres';
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Correo inválido';
  } else if (!values.email.toLowerCase().endsWith(INSTITUTIONAL_DOMAIN)) {
    errors.email = `El correo debe ser institucional (${INSTITUTIONAL_DOMAIN})`;
  }
  if (values.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }
  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Debes aceptar los términos para continuar';
  }

  return errors;
}

export function RegisterContainer() {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange<K extends keyof RegisterFormValues>(field: K, value: RegisterFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validate(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    try {
      await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      navigate('/revisa-tu-correo', { state: { email: values.email } });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo crear la cuenta';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <RegisterForm
      values={values}
      errors={errors}
      loading={loading}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
