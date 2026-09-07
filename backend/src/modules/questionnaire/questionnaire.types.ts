import type { DietType, TransportMode, WasteFrequency } from '../footprint/emissionFactors.js';

export interface QuestionnaireResponse {
  id: string;
  user_id: string;
  transport_mode: TransportMode;
  transport_km_per_trip: string;
  transport_minutes_per_trip: string | null;
  transport_days_per_week: number;
  campus_hours_per_day: string;
  campus_spaces: string[] | null;
  uses_laptop: boolean;
  charges_devices: boolean;
  waste_frequency: WasteFrequency;
  waste_kg_per_week: string;
  waste_composition: string[] | null;
  eats_on_campus: boolean;
  diet_type: DietType;
  transport_kg_co2e: string;
  facilities_kg_co2e: string;
  devices_kg_co2e: string;
  waste_kg_co2e: string;
  diet_kg_co2e: string;
  total_kg_co2e: string;
  created_at: Date;
}
