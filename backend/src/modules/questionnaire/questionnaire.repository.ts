import { pool } from '../../config/db.js';
import type { FootprintInput, FootprintResult } from '../footprint/footprint.service.js';
import type { QuestionnaireResponse } from './questionnaire.types.js';

interface CreateResponseExtras {
  transportMinutesPerTrip?: number;
  campusSpaces?: string[];
  wasteComposition?: string[];
}

export async function createResponse(
  userId: string,
  input: FootprintInput,
  extras: CreateResponseExtras,
  result: FootprintResult,
): Promise<QuestionnaireResponse> {
  const { rows } = await pool.query<QuestionnaireResponse>(
    `INSERT INTO questionnaire_responses (
       user_id, transport_mode, transport_km_per_trip, transport_minutes_per_trip,
       transport_days_per_week, campus_hours_per_day, campus_spaces, uses_laptop,
       charges_devices, waste_frequency, waste_kg_per_week, waste_composition, eats_on_campus,
       diet_type, transport_kg_co2e, facilities_kg_co2e, devices_kg_co2e, waste_kg_co2e,
       diet_kg_co2e, total_kg_co2e
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
     RETURNING *`,
    [
      userId,
      input.transportMode,
      input.transportKmPerTrip,
      extras.transportMinutesPerTrip ?? null,
      input.transportDaysPerWeek,
      input.campusHoursPerDay,
      extras.campusSpaces ?? null,
      input.usesLaptop,
      input.chargesDevices,
      input.wasteFrequency,
      result.wasteKgPerWeek,
      extras.wasteComposition ?? null,
      input.eatsOnCampus,
      input.dietType,
      result.transportKgCo2e,
      result.facilitiesKgCo2e,
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
