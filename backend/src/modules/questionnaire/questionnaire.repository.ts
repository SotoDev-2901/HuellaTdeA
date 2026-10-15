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
       charges_devices, waste_frequency, waste_kg_per_week, waste_composition, eating_frequency,
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
      input.eatingFrequency,
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

/** Reemplaza los datos de una respuesta existente (conserva id y fecha de creación). */
export async function replaceResponse(
  responseId: string,
  userId: string,
  input: FootprintInput,
  extras: CreateResponseExtras,
  result: FootprintResult,
): Promise<QuestionnaireResponse> {
  const { rows } = await pool.query<QuestionnaireResponse>(
    `UPDATE questionnaire_responses SET
       transport_mode = $3, transport_km_per_trip = $4, transport_minutes_per_trip = $5,
       transport_days_per_week = $6, campus_hours_per_day = $7, campus_spaces = $8, uses_laptop = $9,
       charges_devices = $10, waste_frequency = $11, waste_kg_per_week = $12, waste_composition = $13,
       eating_frequency = $14, diet_type = $15, transport_kg_co2e = $16, facilities_kg_co2e = $17,
       devices_kg_co2e = $18, waste_kg_co2e = $19, diet_kg_co2e = $20, total_kg_co2e = $21
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [
      responseId,
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
      input.eatingFrequency,
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

export async function findLatestResponseForUser(userId: string): Promise<{ id: string; created_at: Date } | null> {
  const { rows } = await pool.query<{ id: string; created_at: Date }>(
    'SELECT id, created_at FROM questionnaire_responses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId],
  );
  return rows[0] ?? null;
}
