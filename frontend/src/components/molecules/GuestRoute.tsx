import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Inverso de ProtectedRoute: si ya hay sesión, no tiene sentido ver login/registro de nuevo. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
