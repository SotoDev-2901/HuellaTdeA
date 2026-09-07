import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { createUser, findUserByEmail } from './auth.repository.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import type { AuthUser } from './auth.types.js';

const SALT_ROUNDS = 10;

function toAuthUser(user: { id: string; name: string; email: string; role: string }): AuthUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role as AuthUser['role'] };
}

function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: '8h' });
}

export async function register(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new AppError('Ya existe una cuenta con ese correo', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const created = await createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  const user = toAuthUser(created);
  return { user, token: signToken(user) };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
  const found = await findUserByEmail(input.email);
  if (!found) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const valid = await bcrypt.compare(input.password, found.password_hash);
  if (!valid) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const user = toAuthUser(found);
  return { user, token: signToken(user) };
}
