import { clearStoredSession, getStoredToken, SESSION_EXPIRED_EVENT } from './session';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<TResponse>(
  method: string,
  path: string,
  body?: unknown,
): Promise<TResponse> {
  const token = getStoredToken();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Un 401 con token adjunto significa que la sesión venció o el token es inválido — distinto
    // de un 401 sin token (nunca inició sesión) o el propio login con credenciales incorrectas.
    if (res.status === 401 && token) {
      clearStoredSession();
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(data.message ?? 'Ocurrió un error inesperado', res.status);
  }

  return data as TResponse;
}

export function apiGet<TResponse>(path: string): Promise<TResponse> {
  return request<TResponse>('GET', path);
}

export function apiPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  return request<TResponse>('POST', path, body);
}

export function apiPatch<TResponse>(path: string, body: unknown): Promise<TResponse> {
  return request<TResponse>('PATCH', path, body);
}

export function apiDelete<TResponse = void>(path: string): Promise<TResponse> {
  return request<TResponse>('DELETE', path);
}
