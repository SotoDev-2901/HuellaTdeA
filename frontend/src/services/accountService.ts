import { apiGet, apiPatch, apiPost } from '../lib/api';
import type { AuthUser } from './authService';

export interface AccountProfile extends AuthUser {
  createdAt: string;
}

export async function getProfile(): Promise<AccountProfile> {
  const res = await apiGet<{ user: AccountProfile }>('/account');
  return res.user;
}

export async function updateName(name: string): Promise<AccountProfile> {
  const res = await apiPatch<{ user: AccountProfile }>('/account', { name });
  return res.user;
}

export function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  return apiPost('/account/change-password', { currentPassword, newPassword });
}

export function deleteAccount(password: string): Promise<{ message: string }> {
  return apiPost('/account/delete', { password });
}
