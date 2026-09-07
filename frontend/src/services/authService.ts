import { apiPost } from '../lib/api';

export type UserRole = 'estudiante' | 'docente' | 'administrador';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'estudiante' | 'docente';
}

export interface RegisterResponse {
  user: AuthUser;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>('/auth/register', payload);
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/login', payload);
}

export function verifyEmail(token: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/verify-email', { token });
}

export function resendVerification(email: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/resend-verification', { email });
}

export function forgotPassword(email: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/forgot-password', { email });
}

export function resetPassword(token: string, password: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/reset-password', { token, password });
}
