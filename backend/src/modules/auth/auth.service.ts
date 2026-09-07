import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { sendMail } from '../../shared/mail/mailer.js';
import {
  createAuthToken,
  createUser,
  findUserByEmail,
  findUserById,
  findValidToken,
  invalidatePendingTokens,
  markEmailVerified,
  markTokenUsed,
  updatePasswordHash,
} from './auth.repository.js';
import { resetPasswordTemplate, verifyEmailTemplate } from './auth.emails.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schema.js';
import type { AuthUser } from './auth.types.js';

const SALT_ROUNDS = 10;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

function toAuthUser(user: { id: string; name: string; email: string; role: string }): AuthUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role as AuthUser['role'] };
}

function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: '8h' });
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

async function issueVerificationEmail(user: { id: string; name: string; email: string }) {
  await invalidatePendingTokens(user.id, 'verify_email');
  const token = generateToken();
  await createAuthToken({
    userId: user.id,
    token,
    type: 'verify_email',
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });
  const { subject, html } = verifyEmailTemplate(user.name, token);
  await sendMail(user.email, subject, html);
}

export async function register(input: RegisterInput): Promise<{ user: AuthUser }> {
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

  await issueVerificationEmail(created);

  return { user: toAuthUser(created) };
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

  if (!found.email_verified) {
    throw new AppError('Debes verificar tu correo antes de iniciar sesión', 403);
  }

  const user = toAuthUser(found);
  return { user, token: signToken(user) };
}

export async function verifyEmail(token: string): Promise<void> {
  const found = await findValidToken(token, 'verify_email');
  if (!found) {
    throw new AppError('El enlace de verificación es inválido o expiró', 400);
  }
  await markTokenUsed(found.id);
  await markEmailVerified(found.user_id);
}

export async function resendVerification(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user || user.email_verified) return;
  await issueVerificationEmail(user);
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const user = await findUserByEmail(input.email);
  if (!user) return;

  await invalidatePendingTokens(user.id, 'reset_password');
  const token = generateToken();
  await createAuthToken({
    userId: user.id,
    token,
    type: 'reset_password',
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });
  const { subject, html } = resetPasswordTemplate(user.name, token);
  await sendMail(user.email, subject, html);
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const found = await findValidToken(input.token, 'reset_password');
  if (!found) {
    throw new AppError('El enlace de recuperación es inválido o expiró', 400);
  }

  const user = await findUserById(found.user_id);
  if (!user) {
    throw new AppError('El enlace de recuperación es inválido o expiró', 400);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  await updatePasswordHash(user.id, passwordHash);
  await markTokenUsed(found.id);
}
