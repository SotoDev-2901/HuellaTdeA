import { pool } from '../../config/db.js';

export interface RawFootprintRow {
  transport_kg_co2e: string;
  facilities_kg_co2e: string;
  devices_kg_co2e: string;
  waste_kg_co2e: string;
  created_at: Date;
}

export async function getResponsesForUser(userId: string): Promise<RawFootprintRow[]> {
  const { rows } = await pool.query<RawFootprintRow>(
    `SELECT transport_kg_co2e, facilities_kg_co2e, devices_kg_co2e, waste_kg_co2e, created_at
     FROM questionnaire_responses
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId],
  );
  return rows;
}

/**
 * Última respuesta de CADA usuario (no todas las respuestas), para promediar el estado
 * actual de la comunidad sin que alguien que respondió muchas veces en el pasado pese más
 * que alguien que respondió una sola vez recientemente.
 */
export async function getLatestResponsePerUser(): Promise<RawFootprintRow[]> {
  const { rows } = await pool.query<RawFootprintRow>(
    `SELECT DISTINCT ON (user_id)
       transport_kg_co2e, facilities_kg_co2e, devices_kg_co2e, waste_kg_co2e, created_at
     FROM questionnaire_responses
     ORDER BY user_id, created_at DESC`,
  );
  return rows;
}
