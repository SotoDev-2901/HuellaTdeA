import { pool } from '../../config/db.js';
import type { WasteRecord } from './waste.types.js';
import type { CreateWasteInput, UpdateWasteInput } from './waste.schema.js';

const SELECT_WITH_ZONE = `
  SELECT wr.id, wr.zone_id, z.name AS zone_name, wr.waste_type, wr.kg, wr.recorded_at, wr.created_at
  FROM waste_records wr
  JOIN zones z ON z.id = wr.zone_id
`;

export async function listWasteRecords(): Promise<WasteRecord[]> {
  const { rows } = await pool.query<WasteRecord>(
    `${SELECT_WITH_ZONE} ORDER BY wr.recorded_at DESC, wr.created_at DESC`,
  );
  return rows;
}

export async function findWasteById(id: string): Promise<WasteRecord | null> {
  const { rows } = await pool.query<WasteRecord>(`${SELECT_WITH_ZONE} WHERE wr.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function createWasteRecord(input: CreateWasteInput): Promise<WasteRecord> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO waste_records (zone_id, waste_type, kg, recorded_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [input.zoneId, input.wasteType, input.kg, input.recordedAt],
  );
  const created = await findWasteById(rows[0].id);
  return created as WasteRecord;
}

export async function updateWasteRecord(id: string, input: UpdateWasteInput): Promise<WasteRecord | null> {
  const { rowCount } = await pool.query(
    `UPDATE waste_records SET
       zone_id = COALESCE($2, zone_id),
       waste_type = COALESCE($3, waste_type),
       kg = COALESCE($4, kg),
       recorded_at = COALESCE($5, recorded_at)
     WHERE id = $1`,
    [id, input.zoneId, input.wasteType, input.kg, input.recordedAt],
  );
  if (rowCount === 0) return null;
  return findWasteById(id);
}

export async function deleteWasteRecord(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM waste_records WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
