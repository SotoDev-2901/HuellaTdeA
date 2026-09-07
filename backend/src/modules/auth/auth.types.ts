export type UserRole = 'estudiante' | 'docente' | 'administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
