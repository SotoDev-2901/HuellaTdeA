import { pool } from '../../config/db.js';
import type { AuthToken, AuthTokenType, User } from './auth.types.js';

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const { rows } = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}): Promise<User> {
  const { rows } = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.name, input.email, input.passwordHash, input.role],
  );
  return rows[0];
}

export async function markEmailVerified(userId: string): Promise<void> {
  await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [userId]);
}

export async function updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
}

export async function createAuthToken(input: {
  userId: string;
  token: string;
  type: AuthTokenType;
  expiresAt: Date;
}): Promise<AuthToken> {
  const { rows } = await pool.query<AuthToken>(
    `INSERT INTO auth_tokens (user_id, token, type, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.userId, input.token, input.type, input.expiresAt],
  );
  return rows[0];
}

export async function findValidToken(token: string, type: AuthTokenType): Promise<AuthToken | null> {
  const { rows } = await pool.query<AuthToken>(
    `SELECT * FROM auth_tokens
     WHERE token = $1 AND type = $2 AND used_at IS NULL AND expires_at > now()`,
    [token, type],
  );
  return rows[0] ?? null;
}

export async function markTokenUsed(id: string): Promise<void> {
  await pool.query('UPDATE auth_tokens SET used_at = now() WHERE id = $1', [id]);
}

export async function invalidatePendingTokens(userId: string, type: AuthTokenType): Promise<void> {
  await pool.query(
    'UPDATE auth_tokens SET used_at = now() WHERE user_id = $1 AND type = $2 AND used_at IS NULL',
    [userId, type],
  );
}
