import { pool } from '../../config/db.js';
import type { FootprintInput, FootprintResult } from '../footprint/footprint.service.js';
import type { QuestionnaireResponse } from './questionnaire.types.js';

export async function createResponse(
  userId: string,
  input: FootprintInput,
  result: FootprintResult,
): Promise<QuestionnaireResponse> {
  const { rows } = await pool.query<QuestionnaireResponse>(
    `INSERT INTO questionnaire_responses (
       user_id, transport_mode, transport_km_per_trip, transport_trips_per_week,
       device_hours_per_day, device_days_per_week, waste_kg_per_week, diet_type,
       transport_kg_co2e, devices_kg_co2e, waste_kg_co2e, diet_kg_co2e, total_kg_co2e
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      userId,
      input.transportMode,
      input.transportKmPerTrip,
      input.transportTripsPerWeek,
      input.deviceHoursPerDay,
      input.deviceDaysPerWeek,
      input.wasteKgPerWeek,
      input.dietType,
      result.transportKgCo2e,
      result.devicesKgCo2e,
      result.wasteKgCo2e,
      result.dietKgCo2e,
      result.totalKgCo2e,
    ],
  );
  return rows[0];
}

export async function listResponsesByUser(userId: string): Promise<QuestionnaireResponse[]> {
  const { rows } = await pool.query<QuestionnaireResponse>(
    'SELECT * FROM questionnaire_responses WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  return rows;
}
