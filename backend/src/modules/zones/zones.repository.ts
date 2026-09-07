import { pool } from '../../config/db.js';
import type { Zone } from './zones.types.js';
import type { CreateZoneInput, UpdateZoneInput } from './zones.schema.js';

export async function listZones(): Promise<Zone[]> {
  const { rows } = await pool.query<Zone>('SELECT * FROM zones ORDER BY created_at DESC');
  return rows;
}

export async function findZoneById(id: string): Promise<Zone | null> {
  const { rows } = await pool.query<Zone>('SELECT * FROM zones WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function findZoneByName(name: string): Promise<Zone | null> {
  const { rows } = await pool.query<Zone>('SELECT * FROM zones WHERE lower(name) = lower($1)', [name]);
  return rows[0] ?? null;
}

export async function createZone(input: CreateZoneInput): Promise<Zone> {
  const { rows } = await pool.query<Zone>(
    `INSERT INTO zones (name, description, type)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.name, input.description ?? null, input.type],
  );
  return rows[0];
}

export async function updateZone(id: string, input: UpdateZoneInput): Promise<Zone | null> {
  const { rows } = await pool.query<Zone>(
    `UPDATE zones SET
       name = COALESCE($2, name),
       description = COALESCE($3, description),
       type = COALESCE($4, type),
       status = COALESCE($5, status)
     WHERE id = $1
     RETURNING *`,
    [id, input.name, input.description, input.type, input.status],
  );
  return rows[0] ?? null;
}
