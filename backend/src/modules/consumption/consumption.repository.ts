import { pool } from '../../config/db.js';
import type { ConsumptionRecord } from './consumption.types.js';
import type { CreateConsumptionInput, UpdateConsumptionInput } from './consumption.schema.js';

const SELECT_WITH_ZONE = `
  SELECT cr.id, cr.zone_id, z.name AS zone_name, cr.kwh, cr.recorded_at, cr.created_at
  FROM consumption_records cr
  JOIN zones z ON z.id = cr.zone_id
`;

export async function listConsumptionRecords(): Promise<ConsumptionRecord[]> {
  const { rows } = await pool.query<ConsumptionRecord>(
    `${SELECT_WITH_ZONE} ORDER BY cr.recorded_at DESC, cr.created_at DESC`,
  );
  return rows;
}

export async function findConsumptionById(id: string): Promise<ConsumptionRecord | null> {
  const { rows } = await pool.query<ConsumptionRecord>(`${SELECT_WITH_ZONE} WHERE cr.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function createConsumptionRecord(input: CreateConsumptionInput): Promise<ConsumptionRecord> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO consumption_records (zone_id, kwh, recorded_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [input.zoneId, input.kwh, input.recordedAt],
  );
  const created = await findConsumptionById(rows[0].id);
  return created as ConsumptionRecord;
}

export async function updateConsumptionRecord(
  id: string,
  input: UpdateConsumptionInput,
): Promise<ConsumptionRecord | null> {
  const { rowCount } = await pool.query(
    `UPDATE consumption_records SET
       zone_id = COALESCE($2, zone_id),
       kwh = COALESCE($3, kwh),
       recorded_at = COALESCE($4, recorded_at)
     WHERE id = $1`,
    [id, input.zoneId, input.kwh, input.recordedAt],
  );
  if (rowCount === 0) return null;
  return findConsumptionById(id);
}

export async function deleteConsumptionRecord(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM consumption_records WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
