import bcrypt from 'bcrypt';
import { pool } from '../../config/db.js';
import { AppError } from '../../shared/errors/AppError.js';
import * as authRepository from '../auth/auth.repository.js';

const SALT_ROUNDS = 10;

export interface AccountProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

function toProfile(user: { id: string; name: string; email: string; role: string; created_at: Date }): AccountProfile {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: new Date(user.created_at).toISOString() };
}

async function requireUser(userId: string) {
  const user = await authRepository.findUserById(userId);
  if (!user) throw new AppError('Usuario no encontrado', 404);
  return user;
}

export async function getProfile(userId: string): Promise<AccountProfile> {
  return toProfile(await requireUser(userId) as never);
}

export async function updateName(userId: string, name: string): Promise<AccountProfile> {
  await requireUser(userId);
  const { rows } = await pool.query(`UPDATE users SET name = $1 WHERE id = $2 RETURNING *`, [name, userId]);
  return toProfile(rows[0]);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await requireUser(userId);
  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) throw new AppError('La contraseña actual no es correcta', 400);
  if (currentPassword === newPassword) throw new AppError('La nueva contraseña debe ser distinta de la actual', 400);
  await authRepository.updatePasswordHash(userId, await bcrypt.hash(newPassword, SALT_ROUNDS));
}

/**
 * Elimina la cuenta y todos sus datos personales (respuestas del cuestionario y tokens, por
 * ON DELETE CASCADE). Exige la contraseña como confirmación. La cuenta de administrador no se
 * puede eliminar desde aquí para no dejar el sistema sin quien gestione zonas y registros.
 */
export async function deleteAccount(userId: string, password: string): Promise<void> {
  const user = await requireUser(userId);
  if (user.role === 'administrador') {
    throw new AppError('La cuenta de administrador no se puede eliminar desde la aplicación', 403);
  }
  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) throw new AppError('La contraseña no es correcta', 400);
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}
