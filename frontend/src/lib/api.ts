import { getStoredToken } from './session';

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
