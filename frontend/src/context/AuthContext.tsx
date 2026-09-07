import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser } from '../services/authService';
import { SESSION_STORAGE_KEY } from '../lib/session';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  /** remember=true persiste la sesión en localStorage (sobrevive a cerrar el navegador);
   *  remember=false la guarda solo en sessionStorage (se pierde al cerrar la pestaña). */
  setSession: (user: AuthUser, token: string, remember?: boolean) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);


function readStoredSession(): { user: AuthUser; token: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY) ?? sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readStoredSession();
  const [user, setUser] = useState<AuthUser | null>(stored?.user ?? null);
  const [token, setToken] = useState<string | null>(stored?.token ?? null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      setSession: (nextUser, nextToken, remember = true) => {
        setUser(nextUser);
        setToken(nextToken);
        const payload = JSON.stringify({ user: nextUser, token: nextToken });
        if (remember) {
          localStorage.setItem(SESSION_STORAGE_KEY, payload);
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, payload);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      },
      clearSession: () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      },
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
