import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api';

export type ZoneType = 'academica' | 'administrativa';
export type ZoneStatus = 'activa' | 'inactiva';

export interface Zone {
  id: string;
  name: string;
  description: string | null;
  type: ZoneType;
  status: ZoneStatus;
  created_at: string;
}

export interface CreateZonePayload {
  name: string;
  description?: string;
  type: ZoneType;
}

export interface UpdateZonePayload {
  name?: string;
  description?: string;
  type?: ZoneType;
  status?: ZoneStatus;
}

export async function listZones(): Promise<Zone[]> {
  const res = await apiGet<{ zones: Zone[] }>('/zones');
  return res.zones;
}

export async function createZone(payload: CreateZonePayload): Promise<Zone> {
  const res = await apiPost<{ zone: Zone }>('/zones', payload);
  return res.zone;
}

export async function updateZone(id: string, payload: UpdateZonePayload): Promise<Zone> {
  const res = await apiPatch<{ zone: Zone }>(`/zones/${id}`, payload);
  return res.zone;
}

export function deleteZone(id: string): Promise<void> {
  return apiDelete(`/zones/${id}`);
}
