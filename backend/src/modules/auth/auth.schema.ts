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

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo inválido'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
