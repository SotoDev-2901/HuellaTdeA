import { pool } from '../../config/db.js';

export interface ZoneTotals {
  zone_id: string;
  zone_name: string;
  total_kwh: string;
  total_waste_kg: string;
}

const DEFAULT_FROM = '2000-01-01';
const DEFAULT_TO = '2100-01-01';

export interface AggregateTotals {
  total_kwh: string;
  total_waste_kg: string;
}

export async function getAggregateTotals(from: string, to: string): Promise<AggregateTotals> {
  const { rows } = await pool.query<AggregateTotals>(
    `SELECT
       COALESCE((SELECT SUM(kwh) FROM consumption_records WHERE recorded_at BETWEEN $1 AND $2), 0) AS total_kwh,
       COALESCE((SELECT SUM(kg) FROM waste_records WHERE recorded_at BETWEEN $1 AND $2), 0) AS total_waste_kg`,
    [from, to],
  );
  return rows[0];
}

export async function getZoneCount(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*) FROM zones');
  return Number(rows[0].count);
}

export async function getRegisteredUsersCount(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*) FROM users');
  return Number(rows[0].count);
}

export interface MonthlyAggregateRow {
  month: string; // 'YYYY-MM'
  total_kwh: string;
  total_waste_kg: string;
}

/** Totales institucionales (todas las zonas combinadas) agrupados por mes, para la tendencia. */
export async function getMonthlyInstitutionalTotals(from: string, to: string): Promise<MonthlyAggregateRow[]> {
  const { rows } = await pool.query<MonthlyAggregateRow>(
    `SELECT month,
       SUM(kwh) AS total_kwh,
       SUM(kg) AS total_waste_kg
     FROM (
       SELECT to_char(recorded_at, 'YYYY-MM') AS month, kwh, 0::numeric AS kg
       FROM consumption_records WHERE recorded_at BETWEEN $1 AND $2
       UNION ALL
       SELECT to_char(recorded_at, 'YYYY-MM') AS month, 0::numeric AS kwh, kg
       FROM waste_records WHERE recorded_at BETWEEN $1 AND $2
     ) combined
     GROUP BY month
     ORDER BY month`,
    [from, to],
  );
  return rows;
}

export interface WasteCompositionRow {
  waste_type: string;
  total_kg: string;
}

export async function getWasteCompositionTotals(from: string, to: string): Promise<WasteCompositionRow[]> {
  const { rows } = await pool.query<WasteCompositionRow>(
    `SELECT waste_type, SUM(kg) AS total_kg
     FROM waste_records
     WHERE recorded_at BETWEEN $1 AND $2
     GROUP BY waste_type`,
    [from, to],
  );
  return rows;
}

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

export interface ZoneWasteTypeRow {
  zone_name: string;
  waste_type: string;
  total_kg: string;
}

/** Residuos por zona y tipo en un rango de fechas (para el simulador). */
export async function getZoneWasteByType(from: string, to: string): Promise<ZoneWasteTypeRow[]> {
  const { rows } = await pool.query<ZoneWasteTypeRow>(
    `SELECT z.name AS zone_name, w.waste_type, SUM(w.kg) AS total_kg
     FROM waste_records w JOIN zones z ON z.id = w.zone_id
     WHERE w.recorded_at BETWEEN $1 AND $2
     GROUP BY z.name, w.waste_type`,
    [from, to],
  );
  return rows;
}
