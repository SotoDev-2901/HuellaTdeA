import { z } from 'zod';

const INSTITUTIONAL_DOMAIN = '@correo.tdea.edu.co';

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Correo inválido')
    .refine((email) => email.endsWith(INSTITUTIONAL_DOMAIN), {
      message: `El correo debe ser institucional (${INSTITUTIONAL_DOMAIN})`,
    }),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['estudiante', 'docente'], {
    errorMap: () => ({ message: 'El perfil debe ser Estudiante o Docente' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
