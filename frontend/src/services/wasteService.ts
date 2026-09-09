import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api';

export type WasteType = 'plastico' | 'papel' | 'organico';

export interface WasteRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  waste_type: WasteType;
  kg: string;
  recorded_at: string;
  created_at: string;
}

export interface CreateWastePayload {
  zoneId: string;
  wasteType: WasteType;
  kg: number;
  recordedAt: string;
}

export interface UpdateWastePayload {
  zoneId?: string;
  wasteType?: WasteType;
  kg?: number;
  recordedAt?: string;
}

export async function listWasteRecords(): Promise<WasteRecord[]> {
  const res = await apiGet<{ records: WasteRecord[] }>('/waste');
  return res.records;
}

export async function createWasteRecord(payload: CreateWastePayload): Promise<WasteRecord> {
  const res = await apiPost<{ record: WasteRecord }>('/waste', payload);
  return res.record;
}

export async function updateWasteRecord(id: string, payload: UpdateWastePayload): Promise<WasteRecord> {
  const res = await apiPatch<{ record: WasteRecord }>(`/waste/${id}`, payload);
  return res.record;
}

export function deleteWasteRecord(id: string): Promise<void> {
  return apiDelete(`/waste/${id}`);
}
