export type UserRole = 'estudiante' | 'docente' | 'administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  email_verified: boolean;
  created_at: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type AuthTokenType = 'verify_email' | 'reset_password';

export interface AuthToken {
  id: string;
  user_id: string;
  token: string;
  type: AuthTokenType;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}
