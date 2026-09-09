import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api';

export interface ConsumptionRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  kwh: string;
  recorded_at: string;
  created_at: string;
}

export interface CreateConsumptionPayload {
  zoneId: string;
  kwh: number;
  recordedAt: string;
}

export interface UpdateConsumptionPayload {
  zoneId?: string;
  kwh?: number;
  recordedAt?: string;
}

export async function listConsumptionRecords(): Promise<ConsumptionRecord[]> {
  const res = await apiGet<{ records: ConsumptionRecord[] }>('/consumption');
  return res.records;
}

export async function createConsumptionRecord(
  payload: CreateConsumptionPayload,
): Promise<ConsumptionRecord> {
  const res = await apiPost<{ record: ConsumptionRecord }>('/consumption', payload);
  return res.record;
}

export async function updateConsumptionRecord(
  id: string,
  payload: UpdateConsumptionPayload,
): Promise<ConsumptionRecord> {
  const res = await apiPatch<{ record: ConsumptionRecord }>(`/consumption/${id}`, payload);
  return res.record;
}

export function deleteConsumptionRecord(id: string): Promise<void> {
  return apiDelete(`/consumption/${id}`);
}
