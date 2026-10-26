import { pool } from '../../config/db.js';

export interface LatestPersonRow {
  transport_mode: string;
  transport_km_per_trip: string;
  transport_days_per_week: number;
}

/** Última respuesta de cada usuario: es la "fotografía" actual de hábitos de transporte. */
export async function getLatestTransportPerUser(): Promise<LatestPersonRow[]> {
  const { rows } = await pool.query<LatestPersonRow>(
    `SELECT DISTINCT ON (user_id) transport_mode, transport_km_per_trip, transport_days_per_week
     FROM questionnaire_responses
     ORDER BY user_id, created_at DESC`,
  );
  return rows;
}
