import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(150, 'El nombre es demasiado largo'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Confirma tu contraseña para eliminar la cuenta'),
});
