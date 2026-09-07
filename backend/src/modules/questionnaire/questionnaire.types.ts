import type { DietType, TransportMode } from '../footprint/emissionFactors.js';

export interface QuestionnaireResponse {
  id: string;
  user_id: string;
  transport_mode: TransportMode;
  transport_km_per_trip: string;
  transport_trips_per_week: number;
  device_hours_per_day: string;
  device_days_per_week: number;
  waste_kg_per_week: string;
  diet_type: DietType;
  transport_kg_co2e: string;
  devices_kg_co2e: string;
  waste_kg_co2e: string;
  diet_kg_co2e: string;
  total_kg_co2e: string;
  created_at: Date;
}
