import { pool } from '../../config/db.js';

export interface ZoneTotals {
  zone_id: string;
  zone_name: string;
  total_kwh: string;
  total_waste_kg: string;
}

const DEFAULT_FROM = '2000-01-01';
const DEFAULT_TO = '2100-01-01';

export async function getZoneTotals(from?: string, to?: string): Promise<ZoneTotals[]> {
  const rangeFrom = from ?? DEFAULT_FROM;
  const rangeTo = to ?? DEFAULT_TO;

  const { rows } = await pool.query<ZoneTotals>(
    `SELECT
       z.id AS zone_id,
       z.name AS zone_name,
       COALESCE(cr.total_kwh, 0) AS total_kwh,
       COALESCE(wr.total_kg, 0) AS total_waste_kg
     FROM zones z
     LEFT JOIN (
       SELECT zone_id, SUM(kwh) AS total_kwh
       FROM consumption_records
       WHERE recorded_at BETWEEN $1 AND $2
       GROUP BY zone_id
     ) cr ON cr.zone_id = z.id
     LEFT JOIN (
       SELECT zone_id, SUM(kg) AS total_kg
       FROM waste_records
       WHERE recorded_at BETWEEN $1 AND $2
       GROUP BY zone_id
     ) wr ON wr.zone_id = z.id
     ORDER BY z.name`,
    [rangeFrom, rangeTo],
  );
  return rows;
}
